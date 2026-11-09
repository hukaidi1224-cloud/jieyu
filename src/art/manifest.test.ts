import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ASSETS, BANNED_PATTERNS, OBSERVE_ART, STYLE_LOCK, observeArtFor } from "./manifest";
import { SCENES, sceneFor } from "./scenes";
import { WORLD_EDGES, WORLD_NODES } from "./spatial";

const root = join(process.cwd(), "public");

/** 读 JPEG 的 SOF 段取像素尺寸（不引依赖）。 */
function jpegSize(buf: Buffer): { w: number; h: number } | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

describe("art manifest", () => {
  it("style lock is dirty-flat-v7", () => {
    expect(STYLE_LOCK).toBe("dirty-flat-v7");
    expect(BANNED_PATTERNS.length).toBeGreaterThan(3);
  });

  it("every listed asset file exists under public/", () => {
    const missing: string[] = [];
    Object.values(ASSETS).forEach((a) => {
      expect(a.style).toBe(STYLE_LOCK);
      expect(a.path.startsWith("/art/")).toBe(true);
      const disk = join(root, a.path.replace(/^\//, ""));
      if (!existsSync(disk)) missing.push(a.id + " → " + disk);
    });
    expect(missing).toEqual([]);
  });

  it("scene sizes match the jpeg on disk (舞台按它定比例)", () => {
    const scenes = Object.values(ASSETS).filter((a) => a.kind === "scene");
    expect(scenes.length).toBe(15);
    const mismatched: string[] = [];
    scenes.forEach((a) => {
      const disk = join(root, a.path.replace(/^\//, ""));
      const real = jpegSize(readFileSync(disk));
      if (!real || real.w !== a.w || real.h !== a.h) {
        mismatched.push(a.id + " 登记 " + a.w + "×" + a.h + " / 实图 " + real?.w + "×" + real?.h);
      }
    });
    expect(mismatched).toEqual([]);
  });

  it("overview svg exists", () => {
    expect(existsSync(join(root, "art/map/overview.svg"))).toBe(true);
  });

  it("观察插图映射自洽：标签真在场景上、资产已登记", () => {
    const labels = Object.keys(SCENES)
      .flatMap((id) => SCENES[id].spots)
      .filter((s) => s.kind === "observe" && s.labelExact)
      .map((s) => s.labelExact!);
    const dangling: string[] = [];
    Object.entries(OBSERVE_ART).forEach(([label, assetId]) => {
      if (!ASSETS[assetId]) dangling.push(label + " → " + assetId + "（未登记）");
      else if (ASSETS[assetId].kind !== "observe") dangling.push(label + " → " + assetId + "（类型不对）");
      if (!labels.includes(label)) dangling.push(label + "（没有任何场景用它）");
    });
    expect(dangling).toEqual([]);
    // 每个登记的标签都真能解析出图；未登记的观察点返回 null（只出文，不兜底）
    Object.keys(OBSERVE_ART).forEach((label) => {
      expect(observeArtFor(label)).toBe("/art/observe/" + OBSERVE_ART[label].split(".")[1] + ".jpg");
    });
    const unmapped = labels.filter((l) => !OBSERVE_ART[l]);
    unmapped.forEach((l) => expect(observeArtFor(l)).toBeNull());
    // 26 个观察点已全部挂图；若将来回退成缺图，这条会报出差额而不是悄悄通过
    expect(Object.keys(OBSERVE_ART).length).toBe(labels.length);
  });
});

describe("spatial layout", () => {
  const ids = [
    "S",
    "H",
    "A1",
    "A2",
    "A3",
    "B1",
    "B2",
    "B3",
    "B4",
    "C0",
    "C1",
    "E0",
    "E1",
    "E2",
    "E3",
  ];

  it("world + scenes cover every engine node", () => {
    ids.forEach((id) => {
      expect(WORLD_NODES.some((n) => n.id === id)).toBe(true);
      expect(SCENES[id]).toBeTruthy();
      expect(sceneFor(id).spots.length).toBeGreaterThan(0);
    });
    expect(WORLD_EDGES.length).toBeGreaterThan(8);
  });

  it("A1 exits sit on cardinal edges", () => {
    const s = SCENES.A1;
    const north = s.spots.find((x) => x.labelExact === "进巷")!;
    const south = s.spots.find((x) => x.labelExact === "回店")!;
    const west = s.spots.find((x) => x.labelExact === "绕到深层口")!;
    const east = s.spots.find((x) => x.labelExact === "去工地围挡")!;
    expect(north.y).toBeLessThan(25);
    expect(south.y).toBeGreaterThan(80);
    expect(west.x).toBeLessThan(20);
    expect(east.x).toBeGreaterThan(80);
  });

  it("all engine scenes have dirty-flat art wired", () => {
    [
      "S",
      "H",
      "A1",
      "A2",
      "A3",
      "B1",
      "B2",
      "B3",
      "B4",
      "C0",
      "C1",
      "E0",
      "E1",
      "E2",
      "E3",
    ].forEach((id) => {
      expect(SCENES[id].artId).toBe("scene." + id);
      expect(ASSETS["scene." + id]).toBeTruthy();
    });
  });

  it("alley chain runs south→north on overview", () => {
    const y = (id: string) => WORLD_NODES.find((n) => n.id === id)!.y;
    expect(y("S")).toBeGreaterThan(y("H"));
    expect(y("H")).toBeGreaterThan(y("A1"));
    expect(y("A1")).toBeGreaterThan(y("A2"));
    expect(y("A2")).toBeGreaterThan(y("A3"));
    expect(y("A3")).toBeGreaterThan(y("B1"));
  });
});
