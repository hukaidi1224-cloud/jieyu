/**
 * 借雨美术清单 — 唯一路径真相源。
 * 风格：脏平 v7。禁止把未列路径写进 UI。
 */

export const STYLE_LOCK = "dirty-flat-v7" as const;

/** 明确禁用的样张家族（勿拷进 public/art 正式目录） */
export const BANNED_PATTERNS = [
  "*-v2*",
  "*-v3*",
  "*-v3b*",
  "*-v3c*",
  "*-v4*",
  "*-v5*",
  "*-v6*",
  "yudi-style-yuzhen-v7.jpg",
  "yudi-style-shop*",
  "yudi-style-alley-v2*",
  "yudi-style-alley-v3*",
  "spatial-v7*", // 旧捉刀总图，不作场景底图
] as const;

export type PortraitId = "yuzhen" | "chen" | "float" | "none";

export type ArtAsset = {
  id: string;
  path: string;
  kind: "scene" | "portrait" | "observe";
  style: typeof STYLE_LOCK;
  source: string;
  note?: string;
  /** 场景底图像素尺寸：舞台按它定宽高比，热区百分比即图片百分比 */
  w?: number;
  h?: number;
};

export const ASSETS: Record<string, ArtAsset> = {
  "scene.S": {
    id: "scene.S",
    path: "/art/scenes/S.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-07 top-down wet alley",
    note: "湿巷俯视；热区见 scenes.ts",
    w: 1152,
    h: 864,
  },
  "scene.H": {
    id: "scene.H",
    path: "/art/scenes/H.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08; yellow wait-chair D",
    note: "理发店俯视；等雨椅黄垫显眼",
    w: 1024,
    h: 1024,
  },
  "scene.A1": {
    id: "scene.A1",
    path: "/art/scenes/A1.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 porch hub",
    note: "门廊四向枢纽",
    w: 1024,
    h: 1024,
  },
  "scene.A2": {
    id: "scene.A2",
    path: "/art/scenes/A2.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 alley mid",
    note: "巷中；顶垂须",
    w: 864,
    h: 1152,
  },
  "scene.A3": {
    id: "scene.A3",
    path: "/art/scenes/A3.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 alley end",
    note: "巷尾门洞／湿印",
    w: 864,
    h: 1152,
  },
  "scene.B1": {
    id: "scene.B1",
    path: "/art/scenes/B1.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 citadel gate",
    note: "城寨口",
    w: 1024,
    h: 1024,
  },
  "scene.C0": {
    id: "scene.C0",
    path: "/art/scenes/C0.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 deep gate outside",
    note: "深层口外",
    w: 1152,
    h: 864,
  },
  "scene.C1": {
    id: "scene.C1",
    path: "/art/scenes/C1.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 deep gate inside",
    note: "深层口内；空盔印",
    w: 1024,
    h: 1024,
  },
  "scene.E0": {
    id: "scene.E0",
    path: "/art/scenes/E0.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 site fence",
    note: "工地围挡",
    w: 1152,
    h: 864,
  },
  "scene.E1": {
    id: "scene.E1",
    path: "/art/scenes/E1.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 empty street",
    note: "空街",
    w: 1152,
    h: 864,
  },
  "scene.E2": {
    id: "scene.E2",
    path: "/art/scenes/E2.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 window edge",
    note: "窗边",
    w: 1152,
    h: 864,
  },
  "scene.B2": {
    id: "scene.B2",
    path: "/art/scenes/B2.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 stairwell",
    note: "楼梯",
    w: 864,
    h: 1152,
  },
  "scene.B3": {
    id: "scene.B3",
    path: "/art/scenes/B3.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 seventh floor corner",
    note: "七楼转角",
    w: 1024,
    h: 1024,
  },
  "scene.B4": {
    id: "scene.B4",
    path: "/art/scenes/B4.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 tide step",
    note: "八楼潮底踏",
    w: 1024,
    h: 1024,
  },
  "scene.E3": {
    id: "scene.E3",
    path: "/art/scenes/E3.jpg",
    kind: "scene",
    style: STYLE_LOCK,
    source: "generated 2026-11-08 doorless corridor",
    note: "无门走廊／盔",
    w: 1152,
    h: 864,
  },
  "portrait.yuzhen": {
    id: "portrait.yuzhen",
    path: "/art/portraits/yuzhen.jpg",
    kind: "portrait",
    style: STYLE_LOCK,
    source: "art-samples/yudi-style-yuzhen-v7b.jpg",
  },
  "portrait.chen": {
    id: "portrait.chen",
    path: "/art/portraits/chen.jpg",
    kind: "portrait",
    style: STYLE_LOCK,
    source: "art-samples/yudi-style-chen-v7.jpg",
  },
  "portrait.float": {
    id: "portrait.float",
    path: "/art/portraits/float.jpg",
    kind: "portrait",
    style: STYLE_LOCK,
    source: "art-samples/yudi-style-float-v7.jpg",
  },
  "portrait.cast-ref": {
    id: "portrait.cast-ref",
    path: "/art/portraits/cast-ref.jpg",
    kind: "portrait",
    style: STYLE_LOCK,
    source: "art-samples/yudi-style-cast-v7.jpg",
    note: "设定参考，默认不直接作对白槽",
  },
  "observe.rain-alley": {
    id: "observe.rain-alley",
    path: "/art/observe/rain-alley.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "art-samples/yudi-style-scene-v7.jpg",
    note: "通用雨巷样张；按点细分的插图未生成前先不挂载，勿当占位图铺满",
    w: 1152,
    h: 864,
  },
  "observe.mold-wall": {
    id: "observe.mold-wall",
    path: "/art/observe/mold-wall.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "A1 门廊墙根霉花",
    w: 1472,
    h: 1104,
  },
  "observe.tide-book": {
    id: "observe.tide-book",
    path: "/art/observe/tide-book.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "H 理发店窗台潮簿",
    w: 1472,
    h: 1104,
  },
  "observe.wet-envelope": {
    id: "observe.wet-envelope",
    path: "/art/observe/wet-envelope.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "H 柜台湿信封",
    w: 1472,
    h: 1104,
  },
  "observe.wall-base": {
    id: "observe.wall-base",
    path: "/art/observe/wall-base.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "A3 巷尾墙根积水泥带",
    w: 1472,
    h: 1104,
  },
  "observe.wet-cloth": {
    id: "observe.wet-cloth",
    path: "/art/observe/wet-cloth.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "B1 城寨口墙上的湿布",
    w: 1472,
    h: 1104,
  },
  "observe.tide-step": {
    id: "observe.tide-step",
    path: "/art/observe/tide-step.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "B3 七楼转角踏步",
    w: 1472,
    h: 1104,
  },
  "observe.helmet-mark": {
    id: "observe.helmet-mark",
    path: "/art/observe/helmet-mark.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "C1 深层口内空盔印",
    w: 1472,
    h: 1104,
  },
  "observe.poster": {
    id: "observe.poster",
    path: "/art/observe/poster.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "E0 工地围挡海报",
    w: 1472,
    h: 1104,
  },
  "observe.crane": {
    id: "observe.crane",
    path: "/art/observe/crane.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "E1 空街仰望塔吊",
    w: 1472,
    h: 1104,
  },
  "observe.window-mold": {
    id: "observe.window-mold",
    path: "/art/observe/window-mold.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "E2 窗边窗上的霉",
    w: 1472,
    h: 1104,
  },
  "observe.green-box": {
    id: "observe.green-box",
    path: "/art/observe/green-box.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "A1 门廊挂钩绿盒",
    w: 1472,
    h: 1104,
  },
  "observe.hanging-roots": {
    id: "observe.hanging-roots",
    path: "/art/observe/hanging-roots.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "A2 巷中巷顶垂须",
    w: 1472,
    h: 1104,
  },
  "observe.ahead-alley": {
    id: "observe.ahead-alley",
    path: "/art/observe/ahead-alley.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "A2 巷中看前面（尽头封死的墙，无地名）",
    w: 1472,
    h: 1104,
  },
  "observe.duty-box": {
    id: "observe.duty-box",
    path: "/art/observe/duty-box.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "B1 城寨口出勤箱",
    w: 1472,
    h: 1104,
  },
  "observe.door-frame": {
    id: "observe.door-frame",
    path: "/art/observe/door-frame.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "B1 城寨口门框潮痕",
    w: 1472,
    h: 1104,
  },
  "observe.back-hole": {
    id: "observe.back-hole",
    path: "/art/observe/back-hole.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "B1 城寨口看回去的路（门洞已合）",
    w: 1472,
    h: 1104,
  },
  "observe.ration-ticket": {
    id: "observe.ration-ticket",
    path: "/art/observe/ration-ticket.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "B2 楼梯门缝粮票（字迹不可辨）",
    w: 1472,
    h: 1104,
  },
  "observe.seven-floors": {
    id: "observe.seven-floors",
    path: "/art/observe/seven-floors.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "B2 楼梯看这几层（没有多出来的东西）",
    w: 1472,
    h: 1104,
  },
  "observe.gate-mark": {
    id: "observe.gate-mark",
    path: "/art/observe/gate-mark.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "C0 深层口外看门边",
    w: 1472,
    h: 1104,
  },
  "observe.squad-graffiti": {
    id: "observe.squad-graffiti",
    path: "/art/observe/squad-graffiti.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "C1 深层口内空盔印旁涂鸦（笔触不可辨）",
    w: 1472,
    h: 1104,
  },
  "observe.wall-mold": {
    id: "observe.wall-mold",
    path: "/art/observe/wall-mold.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "C1 深层口内壁上的霉",
    w: 1472,
    h: 1104,
  },
  "observe.sealed-cabinet": {
    id: "observe.sealed-cabinet",
    path: "/art/observe/sealed-cabinet.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "E0 工地围挡封条柜（封条字迹不可辨）",
    w: 1472,
    h: 1104,
  },
  "observe.fence-gap": {
    id: "observe.fence-gap",
    path: "/art/observe/fence-gap.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "E0 工地围挡看缺口",
    w: 1472,
    h: 1104,
  },
  "observe.street-end": {
    id: "observe.street-end",
    path: "/art/observe/street-end.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "E1 空街看街尽头（未完工的楼）",
    w: 1472,
    h: 1104,
  },
  "observe.hoarding-back": {
    id: "observe.hoarding-back",
    path: "/art/observe/hoarding-back.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "E1 空街看回去的围挡（缺口已合）",
    w: 1472,
    h: 1104,
  },
  "observe.empty-street-back": {
    id: "observe.empty-street-back",
    path: "/art/observe/empty-street-back.jpg",
    kind: "observe",
    style: STYLE_LOCK,
    source: "百炼 wan2.7-image 2026-11-09",
    note: "E2 窗边看回空街（街已收回）",
    w: 1472,
    h: 1104,
  },
};

/**
 * 站点根：构建时由 vite.config 的 base 决定（Pages 项目站是 `/jieyu/`），
 * 单测下为 `/`，所以测试里断言的仍然是 `/art/...`。
 */
const SITE_BASE = import.meta.env.BASE_URL;

export function artUrl(assetId: string): string | null {
  const p = ASSETS[assetId]?.path;
  if (!p) return null;
  // ASSETS 里的 path 一律以 "/" 开头（路径真相源），这里换成站点根开头
  return SITE_BASE + p.slice(1);
}

/** 底图像素尺寸；未登记返回 null（舞台用默认比例）。 */
export function artSize(assetId: string): { w: number; h: number } | null {
  const a = ASSETS[assetId];
  return a?.w && a?.h ? { w: a.w, h: a.h } : null;
}

/**
 * 观察文案标签 → 插图资产。
 * 键＝场景里 `kind === "observe"` 浮点的 `labelExact`；没登记的观察只出文（详情左栏收起，不出「插图空位」）。
 * 补一张图就加一行：文件放 `public/art/observe/`，同时在 `ASSETS` 登记 `kind: "observe"` 与真实 `w/h`。
 * 出图入口＝Qoder 自带 ImageGen（会话模型需为非 BYOK 的订阅模型，百炼 API 已于 2026-11-09 定到期停续），
 * 提示词真相源＝`structured/game-design/yudi/借雨-观察插图-出图提示词-20261109.md`。
 * 26 个观察点全部挂图（第一批 10 张＝主脊与旁环优先，第二批 16 张补齐）。
 */
export const OBSERVE_ART: Record<string, string> = {
  "看霉花": "observe.mold-wall",
  "看窗台潮簿": "observe.tide-book",
  "看柜台湿信封": "observe.wet-envelope",
  "看墙根": "observe.wall-base",
  "看墙上的湿布": "observe.wet-cloth",
  "看踏步": "observe.tide-step",
  "看空盔印": "observe.helmet-mark",
  "看海报": "observe.poster",
  "仰望塔吊": "observe.crane",
  "看窗上的霉": "observe.window-mold",
  "看挂钩绿盒": "observe.green-box",
  "看巷顶垂须": "observe.hanging-roots",
  "看前面": "observe.ahead-alley",
  "看出勤箱": "observe.duty-box",
  "看门框": "observe.door-frame",
  "看回去的路": "observe.back-hole",
  "看门缝粮票": "observe.ration-ticket",
  "看这几层": "observe.seven-floors",
  "看门边": "observe.gate-mark",
  "看空盔印旁的涂鸦": "observe.squad-graffiti",
  "看壁上的霉": "observe.wall-mold",
  "看封条柜": "observe.sealed-cabinet",
  "看缺口": "observe.fence-gap",
  "看街尽头": "observe.street-end",
  "看回去的围挡": "observe.hoarding-back",
  "看回空街": "observe.empty-street-back",
};

/** 观察动作对应的插图路径；无图返回 null。 */
export function observeArtFor(label: string): string | null {
  const id = OBSERVE_ART[label];
  return id ? artUrl(id) : null;
}

/** 动作标签粗判立绘（对白向） */
export function portraitForAction(label: string): PortraitId {
  if (/陈琛|编号给陈|粮票给陈|问陈琛|让陈琛|拼残片|手账里|问头盔/.test(label)) return "chen";
  if (/门口的人|听三方|队|同伴|浮游/.test(label)) return "float";
  if (/戴上|不戴|盔/.test(label)) return "yuzhen";
  return "none";
}

export function portraitPath(id: PortraitId): string | null {
  if (id === "none") return null;
  return artUrl(`portrait.${id}`);
}
