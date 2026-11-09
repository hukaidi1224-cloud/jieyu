/**
 * 借雨音效 — 全部 WebAudio 实时合成，无外部文件。
 * 遵循余埠 precedent：AudioContext 延迟到首次用户交互才创建。
 */

let ctx: AudioContext | null = null;
let rainSrc: AudioBufferSourceNode | null = null;
let rainBp: BiquadFilterNode | null = null;
let rainHissGain: GainNode | null = null;
let rainBodyGain: GainNode | null = null;
let tickBuf: AudioBuffer | null = null;
let dropTimer: number | null = null;
let dropDebt = 0;
let master: GainNode | null = null;
let ok = false;

/** 首次交互时调用；幂等。已存在但被自动播放策略挂起时补一次 resume。 */
export function init(volume: number): void {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  ok = true;
  rainStart();
}

/** 所有声音都汇到总音量增益，config 的 masterVolume 因此在实机改得动。 */
function bus(): AudioNode {
  if (!master) throw new Error("audio 未初始化：总音量增益缺失");
  return master;
}

/**
 * 雨态声景的三层的参数表。四档之间把音量、低频成分和雨点密度一起拉开，
 * 雨大就听得见大；晴与回南天退成屋檐滴水，只有零星几滴。
 * 底噪是一条棕噪源分两路：带通路给雨丝的嘶，低通路给暴雨的轰鸣。
 */
export type RainSoundId = "clear" | "humid" | "mid" | "storm";

interface RainProfile {
  hissFreq: number;
  hissQ: number;
  hissVol: number;
  bodyVol: number;
  dropKind: "drip" | "patter";
  dropRate: number;
  dropVol: number;
  dropPitch: number;
}

const RAIN_PROFILES: Record<RainSoundId, RainProfile> = {
  clear: { hissFreq: 2400, hissQ: 0.5, hissVol: 0.010, bodyVol: 0.0, dropKind: "drip", dropRate: 1.2, dropVol: 0.050, dropPitch: 1500 },
  humid: { hissFreq: 1750, hissQ: 0.40, hissVol: 0.020, bodyVol: 0.006, dropKind: "drip", dropRate: 2.4, dropVol: 0.038, dropPitch: 1150 },
  mid: { hissFreq: 1300, hissQ: 0.35, hissVol: 0.055, bodyVol: 0.022, dropKind: "patter", dropRate: 13, dropVol: 0.030, dropPitch: 1900 },
  storm: { hissFreq: 820, hissQ: 0.30, hissVol: 0.120, bodyVol: 0.085, dropKind: "patter", dropRate: 30, dropVol: 0.045, dropPitch: 1500 },
};

/** 当前雨态；未初始化音频时先记在这里，rainStart 建链时按它调音。 */
let profile: RainProfile = RAIN_PROFILES.mid;

/**
 * 切换雨态。音频尚未初始化时只记下参数，等首次交互建链时生效，
 * 因此启动路径也可以安全调用，不会提前创建 AudioContext。
 */
export function setRainAmbience(rain: RainSoundId): void {
  profile = RAIN_PROFILES[rain];
  if (!ctx) return;
  applyProfile(0.7);
  startDrops();
}

/** 雨声底噪：一条棕噪源分嘶声与轰鸣两路。 */
function rainStart(): void {
  if (!ctx) return;
  const c = ctx;
  const len = Math.floor(c.sampleRate * 4);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = last * 0.86 + w * 0.14;
    d[i] = last * 0.9 + w * 0.1;
  }
  rainSrc = c.createBufferSource();
  rainSrc.buffer = buf;
  rainSrc.loop = true;
  rainBp = c.createBiquadFilter();
  rainBp.type = "bandpass";
  rainBp.frequency.value = profile.hissFreq;
  rainBp.Q.value = profile.hissQ;
  const hissLp = c.createBiquadFilter();
  hissLp.type = "lowpass";
  hissLp.frequency.value = 3800;
  rainHissGain = c.createGain();
  rainHissGain.gain.value = 0.0;
  const bodyLp = c.createBiquadFilter();
  bodyLp.type = "lowpass";
  bodyLp.frequency.value = 260;
  rainBodyGain = c.createGain();
  rainBodyGain.gain.value = 0.0;
  rainSrc.connect(rainBp);
  rainBp.connect(hissLp);
  hissLp.connect(rainHissGain);
  rainSrc.connect(bodyLp);
  bodyLp.connect(rainBodyGain);
  rainHissGain.connect(bus());
  rainBodyGain.connect(bus());
  rainSrc.start();
  rainBp.frequency.setTargetAtTime(profile.hissFreq, c.currentTime, 2.0);
  rainHissGain.gain.setTargetAtTime(profile.hissVol, c.currentTime, 2.0);
  rainBodyGain.gain.setTargetAtTime(profile.bodyVol, c.currentTime, 2.0);
  startDrops();
}

/** 把当前雨态推给底噪；tauSec 是渐变的过渡时长。 */
function applyProfile(tauSec: number): void {
  if (!ctx || !rainBp || !rainHissGain || !rainBodyGain) return;
  const t = ctx.currentTime;
  rainBp.frequency.setTargetAtTime(profile.hissFreq, t, tauSec);
  rainBp.Q.setTargetAtTime(profile.hissQ, t, tauSec);
  rainHissGain.gain.setTargetAtTime(profile.hissVol, t, tauSec);
  rainBodyGain.gain.setTargetAtTime(profile.bodyVol, t, tauSec);
}

/**
 * 雨点层：每 200ms 按当前密度补发若干滴。
 * 欠账上限 6 是为了标签页挂起回来时不憋成一片爆响。
 */
const DROP_TICK_MS = 200;

function startDrops(): void {
  if (!ctx || dropTimer !== null) return;
  dropTimer = window.setInterval(tickDrops, DROP_TICK_MS);
}

function tickDrops(): void {
  if (!ctx) return;
  const span = DROP_TICK_MS / 1000;
  dropDebt = Math.min(dropDebt + profile.dropRate * span, 6);
  while (dropDebt >= 1) {
    dropDebt -= 1;
    const when = ctx.currentTime + Math.random() * span;
    if (profile.dropKind === "drip") drip(when);
    else patter(when);
  }
}

/** 屋檐滴落：正弦下滑，一滴一粒，听得清间隔。 */
function drip(when: number): void {
  if (!ctx) return;
  const c = ctx;
  const f = profile.dropPitch * (0.85 + Math.random() * 0.4);
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(f, when);
  o.frequency.exponentialRampToValueAtTime(f * 0.35, when + 0.09);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(profile.dropVol, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.13);
  o.connect(g);
  g.connect(bus());
  o.start(when);
  o.stop(when + 0.16);
}

/** 雨打在地面与棚顶的噼啪：极短的带通噪声粒，密度由 dropRate 决定。 */
function patter(when: number): void {
  if (!ctx) return;
  const c = ctx;
  if (!tickBuf) {
    const n = Math.floor(c.sampleRate * 0.05);
    tickBuf = c.createBuffer(1, n, c.sampleRate);
    const d = tickBuf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5);
    }
  }
  const src = c.createBufferSource();
  src.buffer = tickBuf;
  src.playbackRate.value = 0.8 + Math.random() * 0.6;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = profile.dropPitch * (0.6 + Math.random() * 0.8);
  bp.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(profile.dropVol, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.04);
  src.connect(bp);
  bp.connect(g);
  g.connect(bus());
  src.start(when);
  src.stop(when + 0.06);
}

/** 极短噪声脉冲（点击、开关类）。 */
function noiseBurst(dur: number, vol: number, bpFreq: number, bpQ: number): void {
  if (!ctx) return;
  const c = ctx;
  const t = c.currentTime;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.0);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = bpFreq;
  bp.Q.value = bpQ;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(bus());
  src.start(t);
}

/** 纸页打开：脆短噪声。 */
function paperOpen(): void {
  noiseBurst(0.06, 0.12, 2400, 1.8);
}

/** 纸页合上：更短更钝。 */
function paperClose(): void {
  noiseBurst(0.04, 0.08, 1600, 1.2);
}

/** 翻页：稍长的噪声扫过。 */
function pageTurn(): void {
  if (!ctx) return;
  const c = ctx;
  const t = c.currentTime;
  const dur = 0.18;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const e = Math.sin((Math.PI * i) / len);
    d[i] = (Math.random() * 2 - 1) * e * e * 0.7;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 900;
  const g = c.createGain();
  g.gain.value = 0.1;
  src.connect(hp);
  hp.connect(g);
  g.connect(bus());
  src.start(t);
}

/** 手账打开：纸页声 + 轻低频。 */
function journalOpen(): void {
  paperOpen();
  if (!ctx) return;
  const c = ctx;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = 220;
  const g = c.createGain();
  g.gain.setValueAtTime(0.04, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(g);
  g.connect(bus());
  o.start(t);
  o.stop(t + 0.2);
}

/** 落剪：金属短响。 */
function cutSnip(): void {
  if (!ctx) return;
  const c = ctx;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(3200, t);
  o.frequency.exponentialRampToValueAtTime(1800, t + 0.03);
  const g = c.createGain();
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.connect(g);
  g.connect(bus());
  o.start(t);
  o.stop(t + 0.08);
}

/** 边缘提示：低频闷响。 */
function edgeOpen(): void {
  if (!ctx) return;
  const c = ctx;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(90, t + 0.1);
  const g = c.createGain();
  g.gain.setValueAtTime(0.001, t);
  g.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(g);
  g.connect(bus());
  o.start(t);
  o.stop(t + 0.2);
}

/** 想起名字：两记上行的短音，比观察开关更沉、留得更久。 */
function nameBack(): void {
  if (!ctx) return;
  const c = ctx;
  const t = c.currentTime;
  // 第二记比第一记高，且延得更长：听起来像"想起来"而不是"提示音响"
  const notes: [number, number, number][] = [
    [440, 0, 0.16],
    [660, 0.13, 0.34],
  ];
  for (const [freq, off, dur] of notes) {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    const g = c.createGain();
    const start = t + off;
    g.gain.setValueAtTime(0.001, start);
    g.gain.exponentialRampToValueAtTime(0.075, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(g);
    g.connect(bus());
    o.start(start);
    o.stop(start + dur + 0.05);
  }
}

/** 按 cue id 分发一次性音效；雨态底噪走 setRainAmbience，不在此表内。 */
export function playCue(id: string): void {
  if (!ok) return;
  switch (id) {
    case "paperOpen":
      paperOpen();
      break;
    case "paperClose":
      paperClose();
      break;
    case "pageTurn":
      pageTurn();
      break;
    case "journalOpen":
      journalOpen();
      break;
    case "cutSnip":
      cutSnip();
      break;
    case "edgeOpen":
      edgeOpen();
      break;
    case "nameBack":
      nameBack();
      break;
  }
}
