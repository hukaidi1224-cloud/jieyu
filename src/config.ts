/** Runtime knobs：标题、按键、转场时长与音效 cue 表。cue 名与 audio.ts 的分支一一对应。 */
import * as audio from "./audio";

export const CONFIG = {
  title: "借雨",
  subtitle: "雨底之东 · 试玩 demo",
  version: "0.9.25-audio",
  keys: {
    journal: "KeyJ",
    cutHold: "Space",
  },
  transitionMs: 420,
  audio: {
    enabled: true,
    masterVolume: 0.7,
    /** Cue ids — dispatched to audio.ts. 一次性音效表；雨态底噪另有入口。 */
    cues: {
      tap: "tap",
      paperOpen: "paperOpen",
      paperClose: "paperClose",
      pageTurn: "pageTurn",
      journalOpen: "journalOpen",
      cutSnip: "cutSnip",
      edgeOpen: "edgeOpen",
      nameBack: "nameBack",
    },
  },
} as const;

export type AudioCueId = keyof typeof CONFIG.audio.cues;

/** 首次交互时初始化 AudioContext；之后按 id 分发。 */
export function playCue(_id: AudioCueId): void {
  if (!CONFIG.audio.enabled) return;
  audio.init(CONFIG.audio.masterVolume);
  const cue = CONFIG.audio.cues[_id];
  if (!cue) return;
  audio.playCue(cue);
}

/**
 * 雨态底噪：一次性音效之外常驻的雨声层，随雨大小改变音量、轰鸣与雨点密度。
 * 这里不建 AudioContext —— 音频仍由第一次 playCue 在实际交互里创建，
 * 本函数只把当前雨态交给 audio，未初始化时先记下，建链时生效。
 */
export function setRainAmbience(rain: audio.RainSoundId): void {
  if (!CONFIG.audio.enabled) return;
  audio.setRainAmbience(rain);
}
