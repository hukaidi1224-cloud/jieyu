/**
 * 壳流程：探索热点覆盖主线至城寨门洞（其后逻辑由 playtest 锁引擎）。
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "./ui";

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function spotLabel(n: Element) {
  return (
    n.getAttribute("aria-label") ||
    (n as HTMLElement).dataset.label ||
    n.textContent ||
    ""
  );
}

function clickSpot(root: HTMLElement, text: string) {
  const b = Array.from(root.querySelectorAll(".spot")).find((n) =>
    spotLabel(n).includes(text)
  ) as HTMLButtonElement | undefined;
  if (!b) {
    throw new Error(
      "no spot " +
        text +
        " have=[" +
        Array.from(root.querySelectorAll(".spot"))
          .map((n) => spotLabel(n))
          .join("|") +
        "]"
    );
  }
  b.click();
}

function clickDetail(root: HTMLElement, text: string) {
  const b = Array.from(
    root.querySelectorAll(".detail-acts button, #btn-back-explore")
  ).find((n) => (n.textContent || "").includes(text)) as HTMLButtonElement | undefined;
  if (!b) throw new Error("no detail " + text);
  b.click();
}

async function backIfDetail(root: HTMLElement) {
  await wait(180);
  if (root.querySelector("#shell")?.getAttribute("data-view") === "detail") {
    clickDetail(root, "返回移动");
  }
}

async function goSpot(root: HTMLElement, text: string) {
  await backIfDetail(root);
  clickSpot(root, text);
  await wait(480);
}

describe("shell flow", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("explore/detail through alley door", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    await goSpot(root, "亮灯的店");
    expect(game.state.at).toBe("H");
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("detail");
    expect(root.querySelector("#detail-view")?.classList.contains("no-art")).toBe(true);

    await backIfDetail(root);

    clickSpot(root, "等雨");
    await wait(250);
    clickDetail(root, "等到中雨");
    expect(game.state.rain).toBe("mid");
    await backIfDetail(root);

    await goSpot(root, "出门");
    expect(game.state.at).toBe("A1");

    clickSpot(root, "霉花");
    await wait(250);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("detail");
    // 观察插图已挂：左栏展开、cg 出图且路径指向该观察点的资产
    expect(root.querySelector("#detail-view")?.classList.contains("no-art")).toBe(false);
    const cg = root.querySelector("#detail-cg") as HTMLImageElement;
    expect(cg.hidden).toBe(false);
    expect(cg.getAttribute("src")).toBe("/art/observe/mold-wall.jpg");
    await backIfDetail(root);

    // 第二批补图后绿盒也有图了：同样左栏展开、cg 指向自己的资产
    clickSpot(root, "绿盒");
    await wait(250);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("detail");
    expect(root.querySelector("#detail-view")?.classList.contains("no-art")).toBe(false);
    expect((root.querySelector("#detail-cg") as HTMLImageElement).getAttribute("src")).toBe(
      "/art/observe/green-box.jpg"
    );
    await backIfDetail(root);

    // 回店自动弹出陈琛对白卡——它没有插图，走同一条收起逻辑：整栏收起、cg 清空隐藏
    await goSpot(root, "回店");
    expect(root.querySelector("#detail-view")?.classList.contains("no-art")).toBe(true);
    expect((root.querySelector("#detail-cg") as HTMLImageElement).hidden).toBe(true);
    await backIfDetail(root);

    await goSpot(root, "出门");
    await goSpot(root, "进巷");
    expect(game.state.at).toBe("A2");
    await goSpot(root, "走到巷尾");
    expect(game.state.at).toBe("A3");

    clickSpot(root, "看墙根");
    await wait(250);
    expect(game.state.sawWall).toBe(true);
    await backIfDetail(root);

    await goSpot(root, "走进门洞");
    expect(game.state.at).toBe("B1");
    expect(game.state.knowRain).toBe(true);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("explore");
  }, 20000);

  it("剪完收起剪发条，转成客人的回话", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    await goSpot(root, "亮灯的店");
    await backIfDetail(root);
    expect(game.state.at).toBe("H");

    // 常客只在知道中雨那回事之后才坐下
    game.state.knowRain = true;
    game.render();
    expect(game.activeCut()).toBe("regular");

    await goSpot(root, "陈琛");
    const cutBox = root.querySelector("#cut") as HTMLElement;
    const holdBtn = root.querySelector("#hold") as HTMLElement;
    expect(cutBox.hidden).toBe(false);

    holdBtn.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    // jsdom 的 rAF 比真实浏览器慢得多，按进度轮询而不是按墙钟计时
    for (let i = 0; i < 120 && game.cutProgress() < 45; i++) await wait(25);
    const prog = game.cutProgress();
    expect(prog).toBeGreaterThanOrEqual(40);
    expect(prog).toBeLessThanOrEqual(68);
    holdBtn.dispatchEvent(new Event("pointerup", { bubbles: true }));
    await wait(250);

    // 剪发条收起，正文换成客人那句剧情
    expect(cutBox.hidden).toBe(true);
    expect(root.querySelector("#detail-k")?.textContent).toBe("常客");
    expect(root.querySelector("#detail-body")?.textContent).toContain("雨一变，路就变");
    // 台词写的就是「说完就走」：座位空了，同一个人不能被剪第二次
    expect(game.activeCut()).toBeNull();
    expect(game.state.regularLeft).toBe(true);
    expect(game.state.regularFact).toBe(true);

    // 回到陈琛：不再出现「按住落剪」
    await backIfDetail(root);
    await goSpot(root, "陈琛");
    expect(cutBox.hidden).toBe(true);
    expect(root.querySelector("#detail-body")?.textContent).not.toContain("按住落剪");
  }, 20000);

  it("松手前被打断不算剪下，剪发条仍在", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    await goSpot(root, "亮灯的店");
    await backIfDetail(root);
    game.state.knowRain = true;
    game.render();

    await goSpot(root, "陈琛");
    const cutBox = root.querySelector("#cut") as HTMLElement;
    const holdBtn = root.querySelector("#hold") as HTMLElement;
    const logBefore = game.state.log;

    holdBtn.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await wait(500);
    holdBtn.dispatchEvent(new Event("pointercancel", { bubbles: true }));
    await wait(200);

    expect(game.state.log).toBe(logBefore);
    expect(cutBox.hidden).toBe(false);
    expect(game.activeCut()).toBe("regular");
    expect(game.state.regularLeft).toBeFalsy();
  }, 20000);

  it("找回名字单独成节拍：顶栏亮 + 全屏卡片", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    expect(game.state.name).toBeFalsy();
    expect(root.querySelector("#who")?.textContent).toBe("她还不知道自己的名字");
    expect(root.querySelector("#who")?.classList.contains("who-known")).toBe(false);

    // 走到八楼潮底踏＝learnFold 的触发点（步行链由 mainline 用例覆盖）
    game.go("B4");
    await wait(250);

    expect(game.state.name).toBe("林玉真");
    expect(game.state.fragment).toBe(true);
    expect(game.state.knowFold).toBe(true);

    // 反馈要看得见：顶栏换成名字并高亮，同时弹出全屏卡片
    const who = root.querySelector("#who") as HTMLElement;
    expect(who.textContent).toBe("林玉真");
    expect(who.classList.contains("who-known")).toBe(true);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("detail");
    expect(root.querySelector("#detail-k")?.textContent).toBe("想起一个名字");
    expect(root.querySelector("#detail-body")?.textContent).toContain("你叫林玉真");

    // 立绘是她自己
    const portrait = root.querySelector("#detail-portrait") as HTMLImageElement;
    expect(portrait.hidden).toBe(false);
    expect(portrait.getAttribute("src")).toBe("/art/portraits/yuzhen.jpg");

    // 手账里也钉住这条已知
    const snap = game.journalSnapshot();
    expect(snap.known.join("\n")).toContain("我叫林玉真");

    await backIfDetail(root);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("explore");
    // 卡片只在从无到有一次；后续到站描述不再重复弹
    game.go("B3");
    game.go("B4");
    await wait(250);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("explore");
  }, 20000);

  it("观察圆点常驻：没有开关，进场景就全在", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    // 顶栏不再有观察按钮，也不再有 observe 模式类
    expect(root.querySelector("#btn-observe")).toBeNull();
    expect(root.querySelector("#shell")?.className).not.toContain("observe-on");

    await goSpot(root, "亮灯的店");
    await backIfDetail(root);
    expect(game.state.at).toBe("H");

    // 未点过任何开关，观察点（窗台潮簿／湿信封）与出口／NPC 同屏都在
    // NPC 的 aria-label 会随状态变（如「陈琛，有话可问」），按子串判
    const labels = [...root.querySelectorAll(".spot")].map((n) => spotLabel(n).trim());
    const has = (t: string) => labels.some((l) => l.includes(t));
    expect(["出门", "陈琛", "等雨的椅子", "窗台潮簿", "湿信封"].every(has)).toBe(true);

    await goSpot(root, "出门");
    expect(game.state.at).toBe("A1");
    const a1 = [...root.querySelectorAll(".spot")].map((n) => spotLabel(n).trim());
    const hasA1 = (t: string) => a1.some((l) => l.includes(t));
    expect(["霉花", "绿盒", "回店", "进巷", "深层口", "工地"].every(hasA1)).toBe(true);
  }, 20000);

  it("没名字时「不戴」是看得见的锁，点下去讲清为什么", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    game.state.at = "E3";
    game.state.corridorOpen = true;
    game.state.visited.E3 = true;
    game.state.rain = "humid";
    game.render();
    await wait(250);

    const dots = [...root.querySelectorAll(".spot")].map((n) => spotLabel(n).trim());
    // 不是静默消失：仍摆在那儿，标成关
    expect(dots.some((l) => l.includes("不戴"))).toBe(true);
    expect(dots.some((l) => l.includes("戴上"))).toBe(true);
    const locked = root.querySelector(".spot-locked") as HTMLElement;
    expect(locked).toBeTruthy();
    expect(locked.textContent).toContain("不戴");

    clickSpot(root, "不戴");
    await wait(250);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("detail");
    expect(root.querySelector("#detail-k")?.textContent).toBe("还不是你的选择");
    const body = root.querySelector("#detail-body")?.textContent || "";
    expect(body).toContain("得先知道自己是谁");
    // 教学要把人指回拿名字那条路（名字在更高一层，要雨把那一阶洗实）
    expect(body).toContain("名字");
    expect(body).toContain("一阶");

    // 想起名字后同一个点不再是锁，两个选择都摆出来
    await backIfDetail(root);
    game.state.name = "林玉真";
    game.render();
    await wait(250);
    // 名字从无到有会弹一次「想起一个名字」卡片（上一条用例锁过它），先关掉再查圆点
    expect(root.querySelector("#detail-k")?.textContent).toBe("想起一个名字");
    await backIfDetail(root);
    expect(root.querySelector(".spot-locked")).toBeNull();
    const after = [...root.querySelectorAll(".spot")].map((n) => spotLabel(n).trim());
    expect(after.some((l) => l.includes("不戴"))).toBe(true);
    expect(after.some((l) => l.includes("戴上"))).toBe(true);
  }, 20000);

  it("结局收口：自动挡一次、合上落在场景、手账能重看", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    const layer = root.querySelector("#ending") as HTMLElement;
    expect(layer.hidden).toBe(true);

    game.state.at = "E3";
    game.state.corridorOpen = true;
    game.state.visited.E3 = true;
    game.state.rain = "humid";
    game.state.name = "林玉真";
    game.state.alphaDone = true;
    game.state.gammaDone = true;
    game.render();
    // 上面赋值触发了「找回名字」卡片，先关掉
    await backIfDetail(root);

    clickSpot(root, "戴上");
    await wait(300);
    expect(layer.hidden).toBe(false);
    expect(root.querySelector("#ending-title")?.textContent).toBe("戴上");
    expect(root.querySelector("#ending-kicker")?.textContent).toContain("你把自己交了出去");
    const line = root.querySelector("#ending-line")?.textContent || "";
    expect(line).toContain("口气变了");
    // 分档文案真的进了结局卡：命中两环就有两句
    expect(line).toContain("07 那一格");
    expect(line).toContain("空白成绩栏");
    expect(root.querySelector("#ending-rings")?.textContent).toContain("2 / 9");

    // 合上之后落在探索面，不是一张详情卡
    (root.querySelector("#ending-close") as HTMLElement).click();
    await wait(250);
    expect(layer.hidden).toBe(true);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("explore");

    // 手账里能重看；重看后再次重绘不会被意外关掉
    const jbtn = root.querySelector("#journal-ending") as HTMLElement;
    expect(jbtn.hidden).toBe(false);
    (root.querySelector("#btn-journal") as HTMLElement).click();
    await wait(200);
    jbtn.click();
    await wait(250);
    expect(layer.hidden).toBe(false);
    game.render();
    await wait(200);
    expect(layer.hidden).toBe(false);
  }, 20000);
});
