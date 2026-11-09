/**
 * 壳上点通（呈现方案 §五 F）：引擎在任何局面下给出的动作，
 * 必须落在场景登记的热区上，或从 NPC 对白出——不允许堆进 loose 兜底点。
 * 旁环不标支线：这里只验「够得着」，不验分支归属。
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { createGame } from "../game/engine.js";
import { isDialogueHook } from "../game/hotspots";
import { SCENES, spotCoversLabel } from "./scenes";
import { mount } from "../ui";

type Game = ReturnType<typeof createGame>;

const RAINS = ["clear", "mid", "storm", "humid"];

/** 引擎 state 是模块级单例：每次先全量归零，profile 才有确定含义。 */
function booleanKeys(): string[] {
  return Object.keys(createGame().state).filter(
    (k) => typeof (createGame().state as Record<string, unknown>)[k] === "boolean"
  );
}

/** 把所有布尔位分别压成「全关」「全开」「只看过、还没做完」三种局面。 */
function profiles(): Record<string, boolean>[] {
  const keys = booleanKeys();
  return [
    {},
    Object.fromEntries(keys.map((k) => [k, true])),
    Object.fromEntries(
      keys.map((k) => [
        k,
        k.startsWith("saw") || k.startsWith("read") || k === "scrapsSpawned",
      ])
    ),
  ];
}

function setScene(game: Game, nodeId: string, rain: string, profile: Record<string, boolean>) {
  const zeros = Object.fromEntries(booleanKeys().map((k) => [k, false]));
  Object.assign(game.state, zeros, profile, { at: nodeId, rain, ending: "" });
}

function labelsAt(game: Game): string[] {
  return (game.actionsFor() as { label: string }[]).map((a) => a.label);
}

describe("shell spot coverage", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("每个场景动作都有登记热区或 NPC 对白出口", () => {
    const game = createGame();
    const uncovered: string[] = [];
    for (const profile of profiles()) {
      for (const rain of RAINS) {
        for (const nodeId of Object.keys(SCENES)) {
          setScene(game, nodeId, rain, profile);
          const scene = SCENES[nodeId];
          const hasNpc = scene.spots.some((s) => s.kind === "npc");
          for (const label of labelsAt(game)) {
            const claimed = scene.spots.some((s) => spotCoversLabel(s, label));
            const fromNpc = hasNpc && isDialogueHook(label);
            if (!claimed && !fromNpc) uncovered.push(nodeId + " · " + label);
          }
        }
      }
    }
    expect([...new Set(uncovered)]).toEqual([]);
  });

  it("店内对白钩子不在地面浮点，点陈琛才出", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);
    setScene(game, "H", "mid", { seenChen: true, sawTicket: true });
    game.render();
    await new Promise((r) => window.setTimeout(r, 180));
    const back = root.querySelector("#btn-back-explore") as HTMLButtonElement | null;
    back?.click();
    await new Promise((r) => window.setTimeout(r, 200));

    const labels = () =>
      Array.from(root.querySelectorAll(".spot")).map(
        (n) => (n.getAttribute("aria-label") || "") + "|" + ((n as HTMLElement).dataset.label || "")
      );
    const all = labels();
    expect(all.some((l) => l.includes("把粮票给陈琛看"))).toBe(false);
    expect(all.some((l) => l.includes("拒收粮票"))).toBe(false);
    expect(all.some((l) => l.includes("有话可问"))).toBe(true);

    const chen = Array.from(root.querySelectorAll(".spot")).find((n) =>
      (n.getAttribute("aria-label") || "").includes("有话可问")
    ) as HTMLButtonElement;
    chen.click();
    await new Promise((r) => window.setTimeout(r, 200));
    const detail = Array.from(
      root.querySelectorAll(".detail-acts button")
    ).map((n) => n.textContent || "");
    expect(detail.filter((t) => t.includes("粮票") || t.includes("拒收")).length).toBe(2);
  });
});
