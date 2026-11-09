/**
 * B：壳上主脊至盔「戴上」；C：雨关点教冒烟。
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "./ui";

type Game = ReturnType<typeof mount>;

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
  if (!b) {
    throw new Error(
      "no detail " +
        text +
        " have=[" +
        Array.from(root.querySelectorAll(".detail-acts button, #btn-back-explore"))
          .map((n) => n.textContent)
          .join("|") +
        "]"
    );
  }
  b.click();
}

async function backIfDetail(root: HTMLElement) {
  await wait(120);
  if (root.querySelector("#shell")?.getAttribute("data-view") === "detail") {
    clickDetail(root, "返回移动");
    await wait(40);
  }
}

async function goSpot(root: HTMLElement, text: string) {
  await backIfDetail(root);
  clickSpot(root, text);
  await wait(480);
}

async function doObs(root: HTMLElement, text: string) {
  await backIfDetail(root);
  clickSpot(root, text);
  await wait(220);
  await backIfDetail(root);
}

async function waitRain(root: HTMLElement, label: string) {
  await backIfDetail(root);
  clickSpot(root, "等雨");
  await wait(220);
  clickDetail(root, label);
  await wait(80);
  await backIfDetail(root);
}

function cutGuest(game: Game, which: "regular" | "team" | "wet") {
  if (which === "regular") {
    game.state.regularFact = true;
    game.state.regularLeft = true;
    game.state.heardRootWarn = true;
  } else if (which === "team") {
    game.state.teamFact = true;
    game.state.teamLeft = true;
  } else {
    game.state.wetFact = true;
    game.state.wetLeft = true;
  }
  game.render();
}

describe("rain teach (C)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("A3 locked gate teaches wait mid rain", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    await goSpot(root, "亮灯的店");
    await backIfDetail(root);
    // 晴天出门去巷尾
    await goSpot(root, "出门");
    await goSpot(root, "进巷");
    await goSpot(root, "走到巷尾");
    expect(game.state.at).toBe("A3");
    expect(game.state.rain).toBe("clear");

    const locked = Array.from(root.querySelectorAll(".spot-locked")).find((n) =>
      (n.textContent || "").includes("门洞")
    );
    expect(locked).toBeTruthy();
    (locked as HTMLButtonElement).click();
    await wait(220);
    expect(root.querySelector("#shell")?.getAttribute("data-view")).toBe("detail");
    // 锁教学讲清「这会儿不通」并把去处留在城里（店里的椅子），不再写规则句
    const teach = root.querySelector("#detail-body")?.textContent || "";
    expect(teach).toMatch(/雨/);
    expect(teach).toMatch(/店/);
  });
});

describe("shell mainline to helmet (B)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("主脊戴上", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const game = mount(root);

    await goSpot(root, "亮灯的店");
    await backIfDetail(root);
    await waitRain(root, "等到中雨");
    await goSpot(root, "出门");
    await goSpot(root, "进巷");
    await goSpot(root, "走到巷尾");
    await doObs(root, "看墙根");
    await goSpot(root, "走进门洞");
    expect(game.state.knowRain).toBe(true);

    await goSpot(root, "上楼梯");
    await goSpot(root, "上到七楼转角");
    await doObs(root, "看踏步");
    await goSpot(root, "踏上那一阶");
    expect(game.state.knowFold).toBe(true);

    await goSpot(root, "退回七楼");
    await goSpot(root, "下楼");
    await goSpot(root, "下到城寨口");
    await goSpot(root, "去深层口");
    await goSpot(root, "回店门廊");
    await goSpot(root, "回店");
    await backIfDetail(root);

    await waitRain(root, "等到暴雨");
    await goSpot(root, "出门");
    await goSpot(root, "深层口");
    // 可先进城寨看湿布
    await goSpot(root, "进城寨口");
    await doObs(root, "湿布");
    expect(game.state.sawNumber).toBe(true);
    await goSpot(root, "去深层口");
    await goSpot(root, "进门");
    await doObs(root, "空盔印");
    await doObs(root, "壁上的霉");
    await doObs(root, "口里等雨");
    await doObs(root, "捡起墙上残片");
    await goSpot(root, "出门");
    await doObs(root, "捡起地面残片");
    await goSpot(root, "回店门廊");
    await goSpot(root, "回店");
    await backIfDetail(root);

    clickSpot(root, "陈琛");
    await wait(220);
    clickDetail(root, "把编号给陈琛看");
    await wait(80);
    await backIfDetail(root);
    clickSpot(root, "陈琛");
    await wait(220);
    clickDetail(root, "在手账里拼残片");
    await wait(80);
    await backIfDetail(root);
    expect(game.state.knowHeaven).toBe(true);

    cutGuest(game, "regular");
    clickSpot(root, "陈琛");
    await wait(220);
    clickDetail(root, "听门口的人");
    await wait(80);
    await backIfDetail(root);
    cutGuest(game, "team");

    await waitRain(root, "等到回南天");
    await goSpot(root, "出门");
    await goSpot(root, "进巷");
    await goSpot(root, "走到巷尾");
    await goSpot(root, "走进湿门印");
    expect(game.state.passedHumid).toBe(true);
    await doObs(root, "门框");
    expect(game.state.knowHumid).toBe(true);
    await goSpot(root, "去深层口");
    await goSpot(root, "回店门廊");
    await goSpot(root, "回店");
    await backIfDetail(root);

    cutGuest(game, "wet");
    clickSpot(root, "陈琛");
    await wait(220);
    clickDetail(root, "听三方把话说完");
    await wait(80);
    await backIfDetail(root);
    expect(game.state.knowChoice).toBe(true);

    await goSpot(root, "出门");
    await goSpot(root, "工地");
    await doObs(root, "海报");
    await goSpot(root, "回店门廊");
    await goSpot(root, "回店");
    await backIfDetail(root);
    if (game.state.rain !== "mid") await waitRain(root, "等到中雨");

    await goSpot(root, "出门");
    await goSpot(root, "工地");
    await doObs(root, "缺口");
    await goSpot(root, "走进空街");
    await doObs(root, "看街尽头");
    // 空街可等暴雨
    await backIfDetail(root);
    clickSpot(root, "等雨");
    await wait(220);
    clickDetail(root, "等到暴雨");
    await wait(80);
    await backIfDetail(root);

    await goSpot(root, "走到窗边");
    await doObs(root, "窗上的霉");
    await doObs(root, "窗边等雨");
    await goSpot(root, "走进走廊");
    expect(game.state.at).toBe("E3");

    await backIfDetail(root);
    clickSpot(root, "戴上");
    await wait(220);
    expect(game.state.ending).toBe("wear");
  }, 90000);
});
