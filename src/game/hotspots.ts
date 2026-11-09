/** 动作标签分类：场景热点路由用。 */

export type SpotKind = "observe" | "exit" | "verb";

const EXIT_EXACT = new Set([
  "顺着霉花走",
  "出门",
  "回店",
  "进巷",
  "走到巷尾",
  "退回巷中",
  "回门廊",
  "走进门洞",
  "走进湿门印",
  "返回巷尾",
  "上楼梯",
  "下到城寨口",
  "上到七楼转角",
  "下楼",
  "踏上那一阶",
  "退回七楼",
  "绕到深层口",
  "进城寨口",
  "去深层口",
  "回店门廊",
  "进门",
  "去工地围挡",
  "走进空街",
  "退回围挡",
  "走到窗边",
  "退回空街",
  "走进走廊",
  "退回窗边",
]);

const VERB_PREFIX = [
  "等到",
  "问",
  "听",
  "把",
  "拒收",
  "打开",
  "撕开",
  "再在",
  "捡起",
  "戴上",
  "不戴",
  "让陈琛",
  "在手账",
  "试着拼",
  "看回去",
  "看回",
];

export function classifyLabel(label: string): SpotKind {
  if (EXIT_EXACT.has(label)) return "exit";
  if (label.startsWith("看")) return "observe";
  if (VERB_PREFIX.some((p) => label.startsWith(p))) return "verb";
  return "verb";
}

/**
 * 对白向钩子：不在场景上撒点，从 NPC 出（等雨走椅子枢纽）。
 */
export function isDialogueHook(label: string): boolean {
  return classifyLabel(label) === "verb" && !label.startsWith("等到");
}
