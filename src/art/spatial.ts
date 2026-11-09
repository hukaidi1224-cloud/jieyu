/**
 * 街区总图坐标（百分比，原点左上，北＝上）。
 * 说明文档：structured/game-design/yudi/借雨-空间相对图-20261107.md
 * 总览 SVG：public/art/map/overview.svg
 */

export type WorldNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

/** 总览上的节点落点 — 只表达相对方位，不替代场景热区 */
export const WORLD_NODES: WorldNode[] = [
  { id: "S", label: "湿巷起点", x: 42, y: 90 },
  { id: "H", label: "理发店", x: 42, y: 76 },
  { id: "A1", label: "店门廊", x: 42, y: 60 },
  { id: "A2", label: "巷中", x: 42, y: 46 },
  { id: "A3", label: "巷尾", x: 42, y: 34 },
  { id: "B1", label: "城寨口", x: 42, y: 22 },
  { id: "B2", label: "楼梯", x: 42, y: 14 },
  { id: "B3", label: "七楼", x: 42, y: 8 },
  { id: "B4", label: "八楼", x: 42, y: 3 },
  { id: "C0", label: "深层口外", x: 22, y: 22 },
  { id: "C1", label: "深层口内", x: 8, y: 22 },
  { id: "E0", label: "工地围挡", x: 58, y: 60 },
  { id: "E1", label: "空街", x: 72, y: 60 },
  { id: "E2", label: "窗边", x: 86, y: 60 },
  { id: "E3", label: "走廊", x: 96, y: 60 },
];

export const WORLD_EDGES: { from: string; to: string; rain?: string }[] = [
  { from: "S", to: "H" },
  { from: "H", to: "A1" },
  { from: "A1", to: "A2" },
  { from: "A2", to: "A3" },
  { from: "A3", to: "B1", rain: "mid|humid" },
  { from: "B1", to: "B2" },
  { from: "B2", to: "B3" },
  { from: "B3", to: "B4", rain: "mid+霉" },
  { from: "A1", to: "C0" },
  { from: "B1", to: "C0" },
  { from: "C0", to: "C1", rain: "storm" },
  { from: "A1", to: "E0" },
  { from: "E0", to: "E1", rain: "mid" },
  { from: "E1", to: "E2", rain: "storm" },
  { from: "E2", to: "E3", rain: "走廊开" },
];

export function worldPos(id: string): WorldNode | undefined {
  return WORLD_NODES.find((n) => n.id === id);
}
