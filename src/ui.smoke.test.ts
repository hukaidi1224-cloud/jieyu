/**
 * 壳冒烟：探索↔详情；进店→等中雨→出门。
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "./ui";

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function spot(root: HTMLElement, text: string) {
  return Array.from(root.querySelectorAll(".spot")).find((n) =>
    (n.textContent || "").includes(text)
  ) as HTMLButtonElement | undefined;
}

function detailBtn(root: HTMLElement, text: string) {
  return Array.from(root.querySelectorAll(".detail-acts button, #btn-back-explore")).find((n) =>
    (n.textContent || "").includes(text)
  ) as HTMLButtonElement | undefined;
}

describe("explore / detail shell", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("journal badge lights on new entries and clears when opened", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    mount(root);

    // 开场湿巷已有「还在想」→ 角标
    expect(root.querySelector("#btn-journal")?.classList.contains("has-unread")).toBe(true);
    expect(root.querySelector("#journal-dot")?.hidden).toBe(false);

    (root.querySelector("#btn-journal") as HTMLButtonElement).click();
    expect(root.querySelector("#btn-journal")?.classList.contains("has-unread")).toBe(false);
    expect(root.querySelector("#journal-dot")?.hidden).toBe(true);

    (root.querySelector("#journal-close") as HTMLButtonElement).click();

    spot(root, "亮灯的店")!.click();
    await wait(500);
    expect(root.querySelector("#btn-journal")?.classList.contains("has-unread")).toBe(true);
  });

  it("S → shop → detail → back → wait mid → exit A1", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    expect(game.state.at).toBe("S");
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("explore");
    expect(root.querySelector("#detail-art-slot")).toBeTruthy();

    // 热区与底图同一坐标系：图片、圆点、玩家标记都在画面框内
    const box = root.querySelector("#scene-art-box")!;
    expect(box.querySelector("#scene-art")?.parentElement).toBe(box);
    expect(box.querySelector(".spot")).toBeTruthy();
    expect(box.querySelector("#player")?.parentElement).toBe(box);

    const shop = spot(root, "亮灯的店");
    expect(shop).toBeTruthy();
    shop!.click();
    await wait(500);

    expect(game.state.at).toBe("H");
    expect(game.state.seenChen).toBe(true);
    // 进店开场进详情
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("detail");
    expect(root.querySelector("#detail-view")?.classList.contains("no-art")).toBe(true);

    const back = detailBtn(root, "返回移动");
    expect(back).toBeTruthy();
    back!.click();
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("explore");

    const waitSpot = spot(root, "等雨");
    expect(waitSpot).toBeTruthy();
    waitSpot!.click();
    await wait(250);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("detail");

    const mid = detailBtn(root, "等到中雨");
    expect(mid).toBeTruthy();
    mid!.click();
    expect(game.state.rain).toBe("mid");

    detailBtn(root, "返回移动")!.click();
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("explore");

    const door = spot(root, "出门");
    expect(door).toBeTruthy();
    door!.click();
    await wait(500);
    expect(game.state.at).toBe("A1");
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("explore");
  });
});
