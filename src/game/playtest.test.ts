import { describe, it, expect } from "vitest";
import { createGame } from "./engine.js";

type Game = ReturnType<typeof createGame>;

function click(game: Game, label: string) {
  const acts = game.actionsFor() as { label: string; fn: () => void }[];
  const a = acts.find((x) => x.label === label);
  if (!a) {
    throw new Error(
      "missing action: " +
        label +
        " @ " +
        game.state.at +
        " rain=" +
        game.state.rain +
        " have=[" +
        acts.map((x) => x.label).join("|") +
        "]"
    );
  }
  a.fn();
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

function mainlineToHelmet(game: Game, rings: boolean) {
  click(game, "顺着霉花走");
  expect(game.state.seenChen).toBe(true);
  {
    const snap = game.journalSnapshot();
    // 手账要留下「谁说过什么」和下一步的挂念，但不写攻略句；断言按语义不按原文
    expect(snap.known.some((t) => /陈琛/.test(t))).toBe(true);
    expect(snap.todos.some((t) => /巷尾/.test(t))).toBe(true);
  }
  if (rings) {
    click(game, "看窗台潮簿");
    click(game, "看柜台湿信封");
    expect(game.state.betaDone || game.state.zetaDone).toBe(false);
  }
  click(game, "等到中雨");
  expect(game.journalSnapshot().todos.some((t) => /巷尾/.test(t))).toBe(true);
  click(game, "出门");
  if (rings) {
    click(game, "看挂钩绿盒");
    expect(game.state.etaDone).toBe(false);
  }
  click(game, "进巷");
  if (rings) click(game, "看巷顶垂须");
  click(game, "走到巷尾");
  click(game, "看墙根");
  click(game, "走进门洞");
  expect(game.state.knowRain).toBe(true);
  if (rings) {
    click(game, "看出勤箱");
    expect(game.state.sawBox).toBe(true);
  }
  click(game, "上楼梯");
  if (rings) {
    click(game, "看门缝粮票");
    click(game, "把酱油放回门缝");
    expect(game.state.deltaDone).toBe(true);
  }
  click(game, "上到七楼转角");
  click(game, "看踏步");
  click(game, "踏上那一阶");
  expect(game.state.knowFold && game.state.name === "林玉真").toBe(true);
  click(game, "退回七楼");
  click(game, "下楼");
  click(game, "下到城寨口");
  click(game, "去深层口");
  click(game, "回店门廊");
  click(game, "回店");
  click(game, "等到暴雨");
  click(game, "出门");
  click(game, "绕到深层口");
  click(game, "进城寨口");
  click(game, "看墙上的湿布");
  expect(game.state.sawNumber).toBe(true);
  click(game, "去深层口");
  click(game, "进门");
  click(game, "看空盔印");
  if (rings) {
    click(game, "看空盔印旁的涂鸦");
    expect(game.state.knowCut).toBe(true);
  }
  click(game, "看壁上的霉");
  click(game, "再在口里等一场雨");
  click(game, "捡起墙上残片");
  click(game, "出门");
  click(game, "捡起地面残片");
  if (rings) {
    click(game, "进城寨口");
    click(game, "打开出勤箱");
    expect(game.state.alphaDone).toBe(true);
    click(game, "去深层口");
  }
  click(game, "回店门廊");
  click(game, "回店");
  click(game, "把编号给陈琛看");
  click(game, "在手账里拼残片");
  expect(game.state.knowHeaven).toBe(true);
  if (rings) {
    click(game, "看柜台湿信封");
    expect(game.state.zetaDone).toBe(true);
  }
  cutGuest(game, "regular");
  if (rings) {
    click(game, "问陈琛的手腕");
    expect(game.state.iotaDone).toBe(true);
  }
  click(game, "听门口的人");
  if (rings) {
    click(game, "出门");
    click(game, "看挂钩绿盒");
    expect(game.state.etaDone).toBe(true);
    click(game, "回店");
    click(game, "等到暴雨");
    click(game, "出门");
    click(game, "进巷");
    click(game, "看巷顶垂须");
    expect(game.state.epsilonDone).toBe(true);
    click(game, "回门廊");
    click(game, "回店");
  }
  cutGuest(game, "team");
  click(game, "等到回南天");
  click(game, "出门");
  click(game, "进巷");
  click(game, "走到巷尾");
  click(game, "走进湿门印");
  expect(game.state.passedHumid).toBe(true);
  click(game, "看门框");
  expect(game.state.knowHumid).toBe(true);
  click(game, "去深层口");
  click(game, "回店门廊");
  click(game, "回店");
  cutGuest(game, "wet");
  if (rings) {
    click(game, "看窗台潮簿");
    expect(game.state.betaDone).toBe(true);
  }
  click(game, "听三方把话说完");
  expect(game.state.knowChoice).toBe(true);
  click(game, "出门");
  click(game, "去工地围挡");
  click(game, "看海报");
  if (rings) {
    click(game, "看封条柜");
    click(game, "撕开封条");
    expect(game.state.gammaDone).toBe(true);
  }
  click(game, "回店门廊");
  click(game, "回店");
  if (game.state.rain !== "mid") click(game, "等到中雨");
  click(game, "出门");
  click(game, "去工地围挡");
  click(game, "看缺口");
  click(game, "走进空街");
  if (rings) {
    click(game, "仰望塔吊");
    expect(game.state.thetaDone).toBe(true);
  }
  click(game, "看街尽头");
  click(game, "等到暴雨");
  click(game, "走到窗边");
  click(game, "看窗上的霉");
  click(game, "再在窗边等一场雨");
  click(game, "走进走廊");
  click(game, "戴上");
  expect(game.state.ending).toBe("wear");
  if (rings) expect(game.ringCount()).toBe(9);
  else expect(game.ringCount()).toBe(0);
}

describe("借雨 demo playtest", () => {
  it("全漏主脊戴上", () => {
    const game = createGame();
    mainlineToHelmet(game, false);
  });

  it("九环做满戴上", () => {
    const game = createGame();
    mainlineToHelmet(game, true);
  });

  it("不戴结局与雨边", () => {
    const game = createGame();
    game.state.at = "E3";
    game.state.corridorOpen = true;
    game.state.visited.E3 = true;
    game.state.rain = "humid";
    // 不戴要知道自己的名字才给得出（名字在 B4 由 learnFold 置上）
    game.state.name = "林玉真";
    game.render();
    click(game, "不戴");
    expect(game.state.ending).toBe("leave");
    expect(game.state.helmetOnCounter).toBe(true);
    expect(game.state.at).toBe("H");
    expect(game.canGo("A1", "A2")).toBe(true);
    game.state.rain = "clear";
    expect(game.canGo("A3", "B1")).toBe(false);
    for (const id of [
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
    ]) {
      game.state.at = id;
      const pc = game.placeCopy();
      expect(pc && pc[0] && pc[1]).toBeTruthy();
    }
  });

  it("名字是钥匙：没名字只能戴上", () => {
    const labels = (game: Game) =>
      (game.actionsFor() as { label: string }[]).map((a) => a.label);

    const game = createGame();
    game.state.at = "E3";
    game.state.corridorOpen = true;
    game.state.visited.E3 = true;
    game.state.rain = "humid";
    game.render();

    // 不知道自己是谁：戴上永远可得，不戴给不出
    expect(game.state.name).toBeFalsy();
    expect(labels(game)).toContain("戴上");
    expect(labels(game)).not.toContain("不戴");

    // 想起名字之后，两个都摆出来——仍是选择，不是锁
    game.state.name = "林玉真";
    game.render();
    expect(labels(game)).toContain("戴上");
    expect(labels(game)).toContain("不戴");

    // 已经定了结局，两个都不再给
    click(game, "不戴");
    expect(game.state.ending).toBe("leave");
    expect(labels(game)).not.toContain("戴上");
    expect(labels(game)).not.toContain("不戴");
  });

  it("陈琛闲话：按局面筛句、连着点不重句", () => {
    const game = createGame();
    game.state.at = "H";
    game.state.seenChen = true;
    game.state.rain = "mid";
    game.render();
    const idle = () => game.actionsFor().find((x) => x.label === "跟陈琛闲话一句");
    expect(idle()).toBeTruthy();

    const seen: string[] = [];
    for (let i = 0; i < 5; i++) {
      idle()!.fn();
      seen.push(game.state.log);
    }
    // 5 句里至少 4 句不同：轮换成立，不会连着念同一句
    expect(new Set(seen).size).toBeGreaterThanOrEqual(4);

    // 暴雨该带来暴雨那句；没名字之前不该出现名字那句
    game.state.rain = "storm";
    game.render();
    const stormSeen: string[] = [];
    for (let i = 0; i < 8; i++) {
      idle()!.fn();
      stormSeen.push(game.state.log);
    }
    expect(stormSeen.some((l) => l.includes("这场雨会把路改写"))).toBe(true);
    expect(stormSeen.some((l) => l.includes("记得住就好"))).toBe(false);

    game.state.name = "林玉真";
    game.render();
    const named: string[] = [];
    for (let i = 0; i < 10; i++) {
      idle()!.fn();
      named.push(game.state.log);
    }
    expect(named.some((l) => l.includes("记得住就好"))).toBe(true);
  });

  it("尾声短景只给一次，并按结局与做满程度分档", () => {
    const RINGS = ["alphaDone", "betaDone", "gammaDone", "deltaDone", "epsilonDone",
      "zetaDone", "etaDone", "thetaDone", "iotaDone"];

    const withEnding = (mode: string, rings: number) => {
      const g = createGame();
      RINGS.forEach((k, i) => { (g.state as Record<string, unknown>)[k] = i < rings; });
      g.state.at = "H";
      g.state.seenChen = true;
      g.state.ending = mode;
      g.render();
      return g;
    };

    const g = withEnding("wear", 0);
    const ep = () => g.actionsFor().find((x) => x.label === "再坐一会儿");
    expect(ep()).toBeTruthy();
    ep()!.fn();
    const first = g.state.log;
    expect(first).toContain("椅面还是潮的");
    // 只给一次：读完就从动作表里消失
    expect(ep()).toBeUndefined();

    // 没做完 vs 做满：同一结局的收尾句不同
    const full = withEnding("wear", 9);
    full.actionsFor().find((x) => x.label === "再坐一会儿")!.fn();
    expect(full.state.log).toContain("你数过的那几件事");
    expect(full.state.log).not.toBe(first);

    // 不戴的尾声不该复用戴上的句子
    const left = withEnding("leave", 4);
    left.actionsFor().find((x) => x.label === "再坐一会儿")!.fn();
    expect(left.state.log).toContain("柜台上那顶盔还在");
  });

  it("没走结局就没有尾声", () => {
    const game = createGame();
    game.state.at = "H";
    game.state.seenChen = true;
    game.render();
    expect(game.actionsFor().some((x) => x.label === "再坐一会儿")).toBe(false);
  });
});
