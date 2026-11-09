/**
 * 标题页与说明页：开始之前键盘不参与，开始后 Esc 按层退；说明页把操作和缺口一次讲完。
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "./ui";

function key(code: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { code, bubbles: true }));
}

function byId<T extends HTMLElement>(root: HTMLElement, id: string): T {
  const node = root.querySelector("#" + id) as T | null;
  if (!node) throw new Error("missing #" + id);
  return node;
}

function textOf(root: HTMLElement, id: string): string {
  return (byId(root, id).textContent || "").replace(/\s+/g, "");
}

describe("title card / help", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("标题页挡住按键，点开始之后手账才响应", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    mount(root);

    expect(byId(root, "titlecard").hidden).toBe(false);
    // 覆盖层挡指针，inert 挡 Tab 焦点：底下那层在开始之前碰不到
    expect((byId(root, "explore-view") as HTMLElement).inert).toBe(true);
    expect((root.querySelector(".topbar") as HTMLElement).inert).toBe(true);
    key("KeyJ");
    expect(byId(root, "journal").hidden).toBe(true);

    byId<HTMLButtonElement>(root, "btn-start").click();
    expect(byId(root, "titlecard").hidden).toBe(true);
    expect((byId(root, "explore-view") as HTMLElement).inert).toBe(false);
    key("KeyJ");
    expect(byId(root, "journal").hidden).toBe(false);
  });

  it("标题页写着主脊，说明页把操作、雨与路、剪发和缺口讲完", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    mount(root);

    expect(textOf(root, "title-name")).toContain("借雨");
    expect(textOf(root, "titlecard-line")).toContain("她想找回那晚走过的那条路");
    expect(textOf(root, "titlecard-foot")).toContain("没有存档");

    byId<HTMLButtonElement>(root, "btn-help-title").click();
    expect(byId(root, "help").hidden).toBe(false);
    const help = textOf(root, "help");
    expect(help).toContain("点地面走过去");
    expect(help).toContain("（关）");
    expect(help).toContain("晴、中雨、暴雨、回南天");
    expect(help).toContain("按住落剪");
    expect(help).toContain("没有存档");
    expect(help).toContain("还没在真机上试过");

    byId<HTMLButtonElement>(root, "help-close").click();
    expect(byId(root, "help").hidden).toBe(true);
    // 从标题页打开的说明，合上之后标题页仍在原地
    expect(byId(root, "titlecard").hidden).toBe(false);
  });

  it("开始后顶栏可开说明，Esc 先关说明再关手账", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    mount(root);
    byId<HTMLButtonElement>(root, "btn-start").click();

    byId<HTMLButtonElement>(root, "btn-help").click();
    expect(byId(root, "help").hidden).toBe(false);
    key("Escape");
    expect(byId(root, "help").hidden).toBe(true);

    key("KeyJ");
    expect(byId(root, "journal").hidden).toBe(false);
    key("Escape");
    expect(byId(root, "journal").hidden).toBe(true);
  });
});
