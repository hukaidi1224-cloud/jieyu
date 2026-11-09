/**
 * 音频层两件事：四档雨声的响度阶梯要拉得开、并且都落在可听区；每次点触要立刻发声。
 * jsdom 没有 WebAudio，这里装一个记账用的假 AudioContext，只验「建链时机」与「这一下有没有声音」；
 * 绝对电平用估算模型算——模型常数取自浏览器离线渲染实测（两条链路各自的 RMS 与单记能量），
 * 并用它反算过上线版实测的 -45.5 dBFS（中雨），误差 1% 以内。
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const UNIT = {
  master: 0.7,
  sampleRate: 48000,
  /** 棕噪分别过「带通→低通 3800」与「低通 260」之后的 RMS（单位增益，离线渲染实测） */
  hissRms: { clear: 0.11844, humid: 0.12856, mid: 0.13376, storm: 0.13381 } as Record<string, number>,
  bodyRms: 0.07776,
  /** 单记雨点／一滴在单位音量下的能量 Σv²（离线渲染实测） */
  patterEnergy: 2.3203,
  dripEnergy: 169.6068,
} as const;

type RainId = "clear" | "humid" | "mid" | "storm";
type Profile = Record<string, number | string>;

/** 该雨态的稳态输出电平（dBFS）：三条路按能量相加，再乘总音量。 */
function rainDbfs(rain: RainId, p: Profile): number {
  const hiss = (p.hissVol as number) * UNIT.hissRms[rain];
  const body = (p.bodyVol as number) * UNIT.bodyRms;
  const unit = p.dropKind === "drip" ? UNIT.dripEnergy : UNIT.patterEnergy;
  const dropMeanSquare = ((p.dropVol as number) ** 2 * (p.dropRate as number) * unit) / UNIT.sampleRate;
  const rms = UNIT.master * Math.sqrt(hiss * hiss + body * body + dropMeanSquare);
  return 20 * Math.log10(rms);
}

interface FakeLog {
  contexts: number;
  bufferSources: number;
  /** 每个 createOscillator 记一条：类型与起频（敲击音认三角波 240Hz 上下） */
  oscillators: { type: string; startFreq: number }[];
  /** 连到 destination 的次数：确认总线接上了 */
  toDestination: number;
}

function installFakeAudio(): FakeLog {
  const log: FakeLog = { contexts: 0, bufferSources: 0, oscillators: [], toDestination: 0 };
  const automation = (onWrite?: (v: number) => void) => ({
    value: 0 as number,
    setValueAtTime(v: number) {
      if (onWrite) onWrite(v);
    },
    exponentialRampToValueAtTime() {},
    setTargetAtTime() {},
    linearRampToValueAtTime() {},
    cancelScheduledValues() {},
  });
  const audioParam = (onWrite?: (v: number) => void) => {
    const p = automation(onWrite);
    let stored = 0;
    return Object.assign(p, {
      get value() {
        return stored;
      },
      set value(v: number) {
        stored = v;
        if (onWrite) onWrite(v);
      },
    });
  };
  const destination = { __destination: true };
  const link = () => ({
    connect: (dest: unknown) => {
      if (dest === destination) log.toDestination++;
    },
    disconnect() {},
  });
  class FakeAudioContext {
    sampleRate = UNIT.sampleRate;
    currentTime = 0;
    state = "running";
    destination = destination;
    constructor() {
      log.contexts++;
    }
    resume() {
      return Promise.resolve();
    }
    createGain() {
      return { ...link(), gain: audioParam() };
    }
    createBiquadFilter() {
      return { ...link(), type: "", frequency: audioParam(), Q: audioParam() };
    }
    createBufferSource() {
      log.bufferSources++;
      return { ...link(), buffer: null, loop: false, playbackRate: audioParam(), start() {}, stop() {} };
    }
    createOscillator() {
      const rec = { type: "sine", startFreq: 0 };
      log.oscillators.push(rec);
      return {
        ...link(),
        get type() {
          return rec.type;
        },
        set type(v: string) {
          rec.type = v;
        },
        frequency: audioParam((v) => {
          if (!rec.startFreq) rec.startFreq = v;
        }),
        start() {},
        stop() {},
      };
    }
    createBuffer(_channels: number, length: number) {
      const data = new Float32Array(length);
      return { getChannelData: () => data, length };
    }
  }
  (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
  return log;
}

function spot(root: HTMLElement, text: string): HTMLButtonElement {
  const b = Array.from(root.querySelectorAll(".spot")).find((n) =>
    (n.textContent || "").includes(text)
  ) as HTMLButtonElement | undefined;
  if (!b) throw new Error("热区缺失：" + text);
  return b;
}

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { AudioContext?: unknown }).AudioContext;
  vi.resetModules();
});

describe("audio", () => {
  it("四档雨声单调、相邻档拉得开，最轻的晴也在可听区", async () => {
    const { RAIN_PROFILES } = await import("./audio");
    const order: RainId[] = ["clear", "humid", "mid", "storm"];
    const level = order.map((r) => rainDbfs(r, RAIN_PROFILES[r] as unknown as Profile));
    for (let i = 1; i < order.length; i++) {
      expect(level[i], `${order[i]} 要比 ${order[i - 1]} 响`).toBeGreaterThan(level[i - 1]);
      expect(level[i] - level[i - 1], "相邻两档至少差 3 dB").toBeGreaterThanOrEqual(3);
    }
    // 旧表的中雨实测只有 -45.5 dBFS，笔记本扬声器上等于没有；现在最轻的一档也要站进可听区
    expect(level[0], "晴太轻就等于没有背景音").toBeGreaterThan(-41);
    expect(level[0], "晴太重会盖过叙事").toBeLessThan(-35);
    expect(level[3], "暴雨要明显压过来").toBeLessThan(-20);
    expect(level[3] - level[0], "晴→暴雨总差至少 12 dB").toBeGreaterThanOrEqual(12);
  });

  it("点兴趣点当帧就发一记敲击，开始之前不建 AudioContext", async () => {
    const log = installFakeAudio();
    const { mount } = await import("./ui");
    const root = document.createElement("div");
    document.body.appendChild(root);
    mount(root);
    expect(log.contexts, "标题页之前不该建链").toBe(0);
    expect(log.toDestination).toBe(0);

    (root.querySelector("#btn-start") as HTMLButtonElement).click();
    expect(log.contexts, "开始那一下要把这次可信手势交给音频层建链").toBe(1);
    expect(log.toDestination, "总线要接到 destination").toBeGreaterThan(0);
    const srcAfterStart = log.bufferSources;
    expect(srcAfterStart, "建链即起雨底噪那条循环源").toBeGreaterThan(0);

    const oscBefore = log.oscillators.length;
    spot(root, "亮灯的店").click();
    const knock = log.oscillators
      .slice(oscBefore)
      .find((o) => o.type === "triangle" && o.startFreq > 220 && o.startFreq < 280);
    expect(knock, "点热区要有一记 240Hz 上下的撞击体，也就是敲击音").toBeTruthy();
    expect(log.bufferSources, "敲击的起振噪声也要真发出去").toBeGreaterThan(srcAfterStart);
  });

  it("详情里的选项按钮与地面点击同样有敲击反馈", async () => {
    const log = installFakeAudio();
    const { mount } = await import("./ui");
    const root = document.createElement("div");
    document.body.appendChild(root);
    mount(root);
    (root.querySelector("#btn-start") as HTMLButtonElement).click();

    const stage = root.querySelector("#scene-art-box") as HTMLElement;
    const beforeStage = log.oscillators.length;
    stage.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 20, clientY: 20 }));
    expect(
      log.oscillators.slice(beforeStage).some((o) => o.type === "triangle"),
      "点地面走过去也要有一记敲击"
    ).toBe(true);

    // S → 店里 → 返回移动 → 等雨的椅子：hub 详情里才有选项按钮
    spot(root, "亮灯的店").click();
    await new Promise((r) => window.setTimeout(r, 700));
    const back = Array.from(root.querySelectorAll(".detail-acts button, #btn-back-explore")).find(
      (n) => (n.textContent || "").includes("返回移动")
    ) as HTMLButtonElement | undefined;
    if (!back) throw new Error("进店后没等到「返回移动」");
    const beforeBack = log.bufferSources;
    back.click();
    expect(log.bufferSources, "返回移动要有一下合纸的钝响").toBeGreaterThan(beforeBack);

    spot(root, "等雨").click();
    await new Promise((r) => window.setTimeout(r, 300));
    const acts = Array.from(root.querySelectorAll(".detail-acts button"));
    expect(acts.length, "等雨的椅子要给出换雨选项").toBeGreaterThan(0);
    const beforeAct = log.oscillators.length;
    (acts[0] as HTMLButtonElement).click();
    expect(
      log.oscillators.slice(beforeAct).some((o) => o.type === "triangle"),
      "详情里的选项也要有敲击反馈"
    ).toBe(true);
  });

  it("换雨在未建链时只记参数，建链之后才真正调音", async () => {
    const log = installFakeAudio();
    const audio = await import("./audio");
    audio.setRainAmbience("storm");
    expect(log.contexts, "启动路径换雨不许提前建 AudioContext").toBe(0);
    audio.init(0.55);
    expect(log.contexts).toBe(1);
    audio.init(0.55);
    expect(log.contexts, "init 幂等：第二次不再建 context").toBe(1);
    expect(log.bufferSources, "建链时按暴雨档起底噪与雨点").toBeGreaterThan(0);
  });
});
