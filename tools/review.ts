/**
 * 热区核对页（开发用，不进构建）：?scene=H
 * 底图按原比例铺满，叠 10% 网格与全部热区，用来把圆点对到画上物件。
 */
import { artSize, artUrl } from "../src/art/manifest";
import { SCENES } from "../src/art/scenes";

const ART_W = 900;
const params = new URLSearchParams(location.search);
const nodeId = params.get("scene") || "S";
const scene = SCENES[nodeId];
if (!scene) throw new Error("unknown scene: " + nodeId);

const size = scene.artId ? artSize(scene.artId) : null;
const w = size?.w ?? 4;
const h = size?.h ?? 3;

const stage = document.getElementById("stage")!;
stage.style.width = ART_W + "px";
stage.style.height = Math.round((ART_W * h) / w) + "px";

const img = document.createElement("img");
img.src = (scene.artId && artUrl(scene.artId)) || "";
img.alt = "";
stage.appendChild(img);

const grid = document.createElement("div");
grid.className = "grid";
for (let p = 10; p < 100; p += 10) {
  const v = document.createElement("i");
  v.className = "v" + (p === 50 ? " mid" : "");
  v.style.left = p + "%";
  grid.appendChild(v);
  const hline = document.createElement("i");
  hline.className = "h" + (p === 50 ? " mid" : "");
  hline.style.top = p + "%";
  grid.appendChild(hline);
  const tx = document.createElement("b");
  tx.textContent = String(p);
  tx.style.left = "calc(" + p + "% + 3px)";
  tx.style.top = "2px";
  grid.appendChild(tx);
  const ty = document.createElement("b");
  ty.textContent = String(p);
  ty.style.left = "3px";
  ty.style.top = "calc(" + p + "% + 2px)";
  grid.appendChild(ty);
}
stage.appendChild(grid);

for (const s of scene.spots) {
  const dot = document.createElement("div");
  dot.className = "spot " + s.kind;
  dot.style.left = s.x + "%";
  dot.style.top = s.y + "%";
  const tag = document.createElement("span");
  tag.textContent = s.label + " (" + s.x + "," + s.y + ")";
  dot.appendChild(tag);
  stage.appendChild(dot);
}

document.getElementById("title")!.textContent =
  nodeId + " · " + scene.title + " · " + w + "×" + h;