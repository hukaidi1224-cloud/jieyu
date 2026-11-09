/**
 * 每场景热区 — 百分比相对本场景舞台；出口贴邻接方位（北上南下西左东右）。
 * 总图：spatial.ts；说明：structured/.../借雨-空间相对图-20261107.md
 */

export type SpotKind = "exit" | "observe" | "npc" | "hub" | "verb";

export type SceneSpot = {
  id: string;
  kind: SpotKind;
  label: string;
  x: number;
  y: number;
  r?: number;
  labelExact?: string;
  labelPrefix?: string;
  hubPrefixes?: string[];
  /**
   * 锁态：对应动作不在 actionsFor 时仍显示这个点；
   * 点了进详情教学，不静默消失。雨关掉的路和还没资格做的选择都走这一条机制。
   */
  lockTeach?: string;
  /** 锁态详情标题，缺省「过不去」（路被关掉）；不是路的时候按实际语义给。 */
  lockTitle?: string;
};

export type ScenePalette = {
  frame: string;
  void: string;
  hintBg: string;
  hintFg: string;
};

export type SceneDef = {
  nodeId: string;
  title: string;
  artId: string | null;
  /** 程序底板短标（无 art 时） */
  blurb: string;
  spawn: { x: number; y: number };
  /** 未登记动作的兜底锚点（不扇形乱撒） */
  loose: { x: number; y: number };
  spots: SceneSpot[];
  palette: ScenePalette;
};

export const SCENES: Record<string, SceneDef> = {
  S: {
    nodeId: "S",
    title: "湿巷",
    artId: "scene.S",
    blurb: "南端起点 · 北／右有亮店门 · 左墙霉花",
    spawn: { x: 48, y: 78 },
    loose: { x: 70, y: 70 },
    palette: { frame: "#0e1a20", void: "#0a1418", hintBg: "#0e1a20", hintFg: "#b8ccd4" },
    spots: [
      // 亮灯店门在右壁；左墙霉花是引路景，本身没有动作
      { id: "S-shop", kind: "exit", label: "亮灯的店", x: 78, y: 42, r: 9, labelExact: "顺着霉花走" },
    ],
  },

  H: {
    nodeId: "H",
    title: "理发店",
    artId: "scene.H",
    blurb: "室内 · 南门出门廊 · 西窗黄垫等雨椅 · 中央椅与柜台",
    spawn: { x: 50, y: 72 },
    loose: { x: 78, y: 55 },
    palette: { frame: "#1e1610", void: "#18120c", hintBg: "#1e1610", hintFg: "#d8ccb8" },
    spots: [
      { id: "H-door", kind: "exit", label: "出门", x: 50, y: 90, r: 8, labelExact: "出门" },
      { id: "H-chen", kind: "npc", label: "陈琛", x: 51, y: 37, r: 9 },
      { id: "H-wait", kind: "hub", label: "等雨的椅子", x: 16, y: 38, r: 10, hubPrefixes: ["等到"] },
      { id: "H-book", kind: "observe", label: "窗台潮簿", x: 15, y: 46, r: 6, labelExact: "看窗台潮簿" },
      { id: "H-env", kind: "observe", label: "湿信封", x: 18, y: 47, r: 6, labelExact: "看柜台湿信封" },
      // 对白向动作只从陈琛亮圈出，不再单独落地浮点
    ],
  },

  A1: {
    nodeId: "A1",
    title: "店门廊",
    artId: "scene.A1",
    blurb: "枢纽 · 北巷 · 南店 · 西深层 · 东工地",
    spawn: { x: 48, y: 52 },
    loose: { x: 40, y: 62 },
    palette: { frame: "#161818", void: "#101214", hintBg: "#161818", hintFg: "#c8ccd0" },
    spots: [
      { id: "A1-shop", kind: "exit", label: "回店", x: 50, y: 88, r: 8, labelExact: "回店" },
      { id: "A1-alley", kind: "exit", label: "进巷", x: 50, y: 12, r: 8, labelExact: "进巷" },
      { id: "A1-deep", kind: "exit", label: "深层口", x: 14, y: 48, r: 8, labelExact: "绕到深层口" },
      { id: "A1-site", kind: "exit", label: "工地", x: 88, y: 48, r: 8, labelExact: "去工地围挡" },
      { id: "A1-mold", kind: "observe", label: "霉花", x: 50, y: 38, r: 7, labelExact: "看霉花" },
      { id: "A1-box", kind: "observe", label: "绿盒", x: 60, y: 88, r: 7, labelExact: "看挂钩绿盒" },
    ],
  },

  A2: {
    nodeId: "A2",
    title: "巷中",
    artId: "scene.A2",
    blurb: "南北湿巷 · 南回门廊 · 北去巷尾",
    spawn: { x: 50, y: 58 },
    loose: { x: 68, y: 48 },
    palette: { frame: "#0c1818", void: "#081214", hintBg: "#0c1818", hintFg: "#a8c0c4" },
    spots: [
      { id: "A2-south", kind: "exit", label: "回门廊", x: 50, y: 93, r: 8, labelExact: "回门廊" },
      { id: "A2-north", kind: "exit", label: "走到巷尾", x: 50, y: 19, r: 8, labelExact: "走到巷尾" },
      { id: "A2-roots", kind: "observe", label: "巷顶垂须", x: 58, y: 15, r: 8, labelExact: "看巷顶垂须" },
      { id: "A2-ahead", kind: "observe", label: "看前面", x: 50, y: 42, r: 6, labelExact: "看前面" },
    ],
  },

  A3: {
    nodeId: "A3",
    title: "巷尾",
    artId: "scene.A3",
    blurb: "北＝门洞／湿印通城寨 · 南回巷中",
    spawn: { x: 50, y: 60 },
    loose: { x: 70, y: 55 },
    palette: { frame: "#0e1418", void: "#0a1014", hintBg: "#0e1418", hintFg: "#b0bcc4" },
    spots: [
      { id: "A3-south", kind: "exit", label: "退回巷中", x: 50, y: 88, r: 8, labelExact: "退回巷中" },
      {
        id: "A3-gate",
        kind: "exit",
        label: "走进门洞",
        x: 50,
        y: 16,
        r: 8,
        labelExact: "走进门洞",
        lockTeach: "墙根还潮着，霉停在砖缝上，像曾经从这里穿过去。上一次这里能走，是店里那把椅子上等来的一场雨。",
      },
      {
        id: "A3-wet",
        kind: "exit",
        label: "走进湿门印",
        x: 60,
        y: 17,
        r: 7,
        labelExact: "走进湿门印",
        lockTeach: "那圈湿印浅了，砖面干得发白。它要的是天像晴、墙却在出汗的那种潮——这种天，店里那枚徽章比抬头看天准。",
      },
      { id: "A3-wall", kind: "observe", label: "看墙根", x: 36, y: 62, r: 7, labelExact: "看墙根" },
    ],
  },

  B1: {
    nodeId: "B1",
    title: "城寨口",
    artId: "scene.B1",
    blurb: "北上楼梯 · 南回巷尾 · 西深层口",
    spawn: { x: 50, y: 55 },
    loose: { x: 72, y: 48 },
    palette: { frame: "#18140e", void: "#14100a", hintBg: "#18140e", hintFg: "#ccc0b0" },
    spots: [
      { id: "B1-up", kind: "exit", label: "上楼梯", x: 50, y: 14, r: 8, labelExact: "上楼梯" },
      {
        id: "B1-south",
        kind: "exit",
        label: "返回巷尾",
        x: 50,
        y: 90,
        r: 8,
        labelExact: "返回巷尾",
        lockTeach: "来时的门洞收了，墙面只剩一道潮印，摸上去已经沙手。往里还能绕到深层口；要它再开一次，得等一场能把洞洗出来的雨。",
      },
      { id: "B1-deep", kind: "exit", label: "去深层口", x: 14, y: 50, r: 7, labelExact: "去深层口" },
      { id: "B1-box", kind: "observe", label: "出勤箱", x: 34, y: 52, r: 6, labelExact: "看出勤箱" },
      { id: "B1-open", kind: "verb", label: "打开出勤箱", x: 36, y: 56, r: 5, labelExact: "打开出勤箱" },
      { id: "B1-cloth", kind: "observe", label: "湿布", x: 32, y: 46, r: 6, labelExact: "看墙上的湿布" },
      { id: "B1-frame", kind: "observe", label: "门框", x: 41, y: 79, r: 6, labelExact: "看门框" },
      { id: "B1-backlook", kind: "observe", label: "看回去的路", x: 50, y: 84, r: 5, labelExact: "看回去的路" },
    ],
  },

  B2: {
    nodeId: "B2",
    title: "楼梯",
    artId: "scene.B2",
    blurb: "北上七楼 · 南下城寨口",
    spawn: { x: 50, y: 55 },
    loose: { x: 70, y: 45 },
    palette: { frame: "#141210", void: "#100e0c", hintBg: "#141210", hintFg: "#c0b8b0" },
    spots: [
      { id: "B2-down", kind: "exit", label: "下到城寨口", x: 50, y: 88, r: 8, labelExact: "下到城寨口" },
      { id: "B2-up", kind: "exit", label: "上到七楼转角", x: 50, y: 11, r: 8, labelExact: "上到七楼转角" },
      { id: "B2-ticket", kind: "observe", label: "门缝粮票", x: 64, y: 47, r: 6, labelExact: "看门缝粮票" },
      { id: "B2-soy", kind: "verb", label: "把酱油放回门缝", x: 65, y: 51, r: 5, labelExact: "把酱油放回门缝" },
      { id: "B2-floors", kind: "observe", label: "看这几层", x: 40, y: 40, r: 6, labelExact: "看这几层" },
    ],
  },

  B3: {
    nodeId: "B3",
    title: "七楼转角",
    artId: "scene.B3",
    blurb: "北＝潮底踏（雨锁）· 南下楼",
    spawn: { x: 50, y: 55 },
    loose: { x: 68, y: 50 },
    palette: { frame: "#121418", void: "#0e1014", hintBg: "#121418", hintFg: "#b8bcc8" },
    spots: [
      { id: "B3-down", kind: "exit", label: "下楼", x: 50, y: 88, r: 8, labelExact: "下楼" },
      {
        id: "B3-step",
        kind: "exit",
        label: "踏上那一阶",
        x: 50,
        y: 18,
        r: 8,
        labelExact: "踏上那一阶",
        lockTeach: "这一阶虚着，踩上去底下是空的。踏步边的潮只补到一半——雨再密一档，它才肯实。",
      },
      { id: "B3-look", kind: "observe", label: "看踏步", x: 38, y: 22, r: 7, labelExact: "看踏步" },
    ],
  },

  B4: {
    nodeId: "B4",
    title: "八楼潮底踏",
    artId: "scene.B4",
    blurb: "尽端 · 南退回七楼",
    spawn: { x: 50, y: 45 },
    loose: { x: 65, y: 55 },
    palette: { frame: "#0e1218", void: "#0a0e14", hintBg: "#0e1218", hintFg: "#b0b8c8" },
    spots: [
      { id: "B4-back", kind: "exit", label: "退回七楼", x: 50, y: 88, r: 8, labelExact: "退回七楼" },
    ],
  },

  C0: {
    nodeId: "C0",
    title: "深层口外",
    artId: "scene.C0",
    blurb: "西进门（暴雨）· 东回门廊／城寨 · 北偏城寨",
    spawn: { x: 55, y: 55 },
    loose: { x: 70, y: 70 },
    palette: { frame: "#141810", void: "#10140c", hintBg: "#141810", hintFg: "#c0c8b0" },
    spots: [
      { id: "C0-porch", kind: "exit", label: "回店门廊", x: 88, y: 70, r: 7, labelExact: "回店门廊" },
      { id: "C0-citadel", kind: "exit", label: "进城寨口", x: 72, y: 30, r: 7, labelExact: "进城寨口" },
      {
        id: "C0-in",
        kind: "exit",
        label: "进门",
        x: 17,
        y: 30,
        r: 8,
        labelExact: "进门",
        lockTeach: "水渍往门缝里咬，渍痕比巷尾那道更重。这道口不吃小雨，只认压住整个屋顶的那种水声。",
      },
      { id: "C0-edge", kind: "observe", label: "看门边", x: 34, y: 38, r: 7, labelExact: "看门边" },
      { id: "C0-scrap", kind: "verb", label: "捡起地面残片", x: 28, y: 77, r: 6, labelExact: "捡起地面残片" },
    ],
  },

  C1: {
    nodeId: "C1",
    title: "深层口内",
    artId: "scene.C1",
    blurb: "口内室 · 东出门",
    spawn: { x: 45, y: 55 },
    loose: { x: 60, y: 70 },
    palette: { frame: "#1a1410", void: "#16100c", hintBg: "#1a1410", hintFg: "#d0c0b0" },
    spots: [
      { id: "C1-out", kind: "exit", label: "出门", x: 87, y: 45, r: 8, labelExact: "出门" },
      { id: "C1-helm", kind: "observe", label: "空盔印", x: 44, y: 53, r: 7, labelExact: "看空盔印" },
      { id: "C1-graf", kind: "observe", label: "涂鸦", x: 33, y: 9, r: 6, labelExact: "看空盔印旁的涂鸦" },
      { id: "C1-mold", kind: "observe", label: "壁上的霉", x: 28, y: 38, r: 6, labelExact: "看壁上的霉" },
      { id: "C1-wait", kind: "verb", label: "口里等雨", x: 50, y: 40, r: 7, labelExact: "再在口里等一场雨" },
      { id: "C1-scrap", kind: "verb", label: "捡起墙上残片", x: 25, y: 32, r: 5, labelExact: "捡起墙上残片" },
    ],
  },

  E0: {
    nodeId: "E0",
    title: "工地围挡",
    artId: "scene.E0",
    blurb: "西回门廊 · 东进空街（中雨）",
    spawn: { x: 45, y: 55 },
    loose: { x: 55, y: 35 },
    palette: { frame: "#18160e", void: "#14120a", hintBg: "#18160e", hintFg: "#c8c0a8" },
    spots: [
      { id: "E0-porch", kind: "exit", label: "回店门廊", x: 11, y: 46, r: 8, labelExact: "回店门廊" },
      {
        id: "E0-street",
        kind: "exit",
        label: "走进空街",
        x: 67,
        y: 49,
        r: 8,
        labelExact: "走进空街",
        lockTeach: "缺口里的风是干的，缝边却还潮着。要它开成能钻过去的口子，得是砸在棚顶上一粒一粒的那种雨。",
      },
      { id: "E0-poster", kind: "observe", label: "海报", x: 37, y: 33, r: 6, labelExact: "看海报" },
      { id: "E0-cab", kind: "observe", label: "封条柜", x: 62, y: 48, r: 6, labelExact: "看封条柜" },
      { id: "E0-tear", kind: "verb", label: "撕开封条", x: 63, y: 55, r: 5, labelExact: "撕开封条" },
      { id: "E0-gap", kind: "observe", label: "缺口", x: 67, y: 57, r: 6, labelExact: "看缺口" },
    ],
  },

  E1: {
    nodeId: "E1",
    title: "空街",
    artId: "scene.E1",
    blurb: "西回围挡 · 东去窗边（暴雨）",
    spawn: { x: 50, y: 55 },
    loose: { x: 50, y: 30 },
    palette: { frame: "#101418", void: "#0c1014", hintBg: "#101418", hintFg: "#b0b8c4" },
    spots: [
      { id: "E1-back", kind: "exit", label: "退回围挡", x: 10, y: 30, r: 8, labelExact: "退回围挡" },
      {
        id: "E1-win",
        kind: "exit",
        label: "走到窗边",
        x: 93,
        y: 50,
        r: 8,
        labelExact: "走到窗边",
        lockTeach: "窗缝里的光在晃，像有水从它前面流过。这种口要的水声不是眼下的——上一次那样的雨，是在店里那把椅子上等来的。",
      },
      { id: "E1-crane", kind: "observe", label: "仰望塔吊", x: 62, y: 20, r: 7, labelExact: "仰望塔吊" },
      { id: "E1-end", kind: "observe", label: "看街尽头", x: 88, y: 45, r: 6, labelExact: "看街尽头" },
      { id: "E1-look", kind: "observe", label: "看回去的围挡", x: 27, y: 33, r: 5, labelExact: "看回去的围挡" },
      {
        id: "E1-wait",
        kind: "hub",
        label: "等雨",
        x: 50,
        y: 72,
        r: 7,
        hubPrefixes: ["等到"],
      },
    ],
  },

  E2: {
    nodeId: "E2",
    title: "窗边",
    artId: "scene.E2",
    blurb: "西回空街 · 东进走廊（开后）",
    spawn: { x: 45, y: 55 },
    loose: { x: 55, y: 35 },
    palette: { frame: "#141814", void: "#101410", hintBg: "#141814", hintFg: "#b8c8b8" },
    spots: [
      {
        id: "E2-back",
        kind: "exit",
        label: "退回空街",
        x: 10,
        y: 55,
        r: 8,
        labelExact: "退回空街",
        lockTeach: "来时的空街收回了，幕墙还贴着脸。这一处的潮停在玻璃里面，不走——窗上的霉还在长。",
      },
      {
        id: "E2-hall",
        kind: "exit",
        label: "走进走廊",
        x: 95,
        y: 50,
        r: 8,
        labelExact: "走进走廊",
        lockTeach: "窗边只有霉和潮叠在一起，没有门。上一次走廊出现在这里，是潮停在玻璃上、半天不散的那种天气。",
      },
      { id: "E2-mold", kind: "observe", label: "窗上的霉", x: 73, y: 52, r: 7, labelExact: "看窗上的霉" },
      { id: "E2-look", kind: "observe", label: "看回空街", x: 20, y: 58, r: 5, labelExact: "看回空街" },
      { id: "E2-waitwin", kind: "verb", label: "窗边等雨", x: 64, y: 58, r: 7, labelExact: "再在窗边等一场雨" },
      {
        id: "E2-wait",
        kind: "hub",
        label: "等雨",
        x: 40,
        y: 75,
        r: 7,
        hubPrefixes: ["等到"],
      },
    ],
  },

  E3: {
    nodeId: "E3",
    title: "无门走廊",
    artId: "scene.E3",
    blurb: "西退窗边 · 尽头盔",
    spawn: { x: 40, y: 55 },
    loose: { x: 55, y: 40 },
    palette: { frame: "#18101a", void: "#140c16", hintBg: "#18101a", hintFg: "#c8b0d0" },
    spots: [
      { id: "E3-back", kind: "exit", label: "退回窗边", x: 12, y: 55, r: 8, labelExact: "退回窗边" },
      { id: "E3-wear", kind: "verb", label: "戴上", x: 70, y: 47, r: 8, labelExact: "戴上" },
      {
        id: "E3-refuse",
        kind: "verb",
        label: "不戴",
        x: 66,
        y: 58,
        r: 8,
        labelExact: "不戴",
        lockTitle: "还不是你的选择",
        lockTeach:
          "把盔留在柜台上，得先知道自己是谁。这句话你现在说不出口——那不是拒绝，只是没接住。名字落在更高的一层，要雨把多出来的一阶洗实了才上得去。",
      },
    ],
  },
};

/** 这个热区是否「认领」某条动作标签（渲染与覆盖率检查同一口径）。 */
export function spotCoversLabel(spot: SceneSpot, label: string): boolean {
  if (spot.kind === "hub") return (spot.hubPrefixes ?? []).some((p) => label.startsWith(p));
  if (spot.kind === "npc") return false;
  if (spot.labelExact) return spot.labelExact === label;
  if (spot.labelPrefix) return label.startsWith(spot.labelPrefix);
  return false;
}

export function sceneFor(nodeId: string): SceneDef {  const hit = SCENES[nodeId];
  if (hit) return hit;
  return {
    nodeId,
    title: nodeId,
    artId: null,
    blurb: "未登记节点",
    spawn: { x: 50, y: 55 },
    loose: { x: 70, y: 70 },
    spots: [],
    palette: { frame: "#121a20", void: "#152028", hintBg: "#121a20", hintFg: "#d5dde4" },
  };
}
