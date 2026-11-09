/**
 * 两态壳：探索（移动场景）↔ 详情（插图＋正文＋选项）。
 * 兴趣点／对白／等雨／落剪进详情；出门换景留在探索。插图可缺，缺则整栏收起。
 * 最上层另有三张纸：标题页（开始之前挡住全部交互）、说明页、结局卡。
 */
import {
  artSize,
  artUrl,
  observeArtFor,
  portraitForAction,
  portraitPath,
  type PortraitId,
} from "./art/manifest";
import { sceneFor, spotCoversLabel, type SceneSpot } from "./art/scenes";
import type { RainSoundId } from "./audio";
import { CONFIG, playCue, setRainAmbience } from "./config";
import { createGame } from "./game/engine.js";
import { classifyLabel, isDialogueHook } from "./game/hotspots";

type Game = ReturnType<typeof createGame>;
type Act = { label: string; fn: () => void; ghost?: boolean };

const RAIN_CLASS: Record<string, string> = {
  mid: "rain-mid",
  clear: "rain-clear",
  storm: "rain-storm",
  humid: "rain-humid",
};

type View = "explore" | "detail";
type DetailKind = "observe" | "talk" | "hub" | "cut" | "result";

/**
 * 说明书从场景里挪到这里：操作、雨与路的关系、剪发手感、试玩版的缺口，
 * 一次讲完，游戏内的文案因此不必再替说明负责（灰盒腔已在批 5 删掉）。
 */
function helpMarkup(): string {
  return `
      <div class="help" id="help" role="dialog" aria-modal="true" aria-labelledby="help-title" hidden>
        <div class="help-card">
          <h2 id="help-title">怎么玩</h2>
          <div class="help-body">
            <div class="help-sub">走与看</div>
            <ul>
              <li>点地面走过去，点亮着的圆点做那件事。</li>
              <li>圆点写成「……（关）」的是眼下过不去的路，点开会说为什么。</li>
              <li>按 J 或右上角「手账」，看还没想通的事和记下的东西。</li>
              <li>按 Esc 退回上一层，「返回移动」回到能走动的画面。</li>
            </ul>
            <div class="help-sub">雨和路</div>
            <ul>
              <li>店里的椅子能把雨等来：晴、中雨、暴雨、回南天。</li>
              <li>雨一改，巷子里能走的路跟着改。走不通先回店里换一场。</li>
              <li>有的路不看天，看你已经知道什么。</li>
            </ul>
            <div class="help-sub">剪发</div>
            <ul>
              <li>有人坐到椅子上时会出现「按住落剪」：按住推进，松手停住。</li>
              <li>范围线可以在同一处收起，收起后凭手感落剪。</li>
            </ul>
            <div class="help-sub">试玩版的已知问题</div>
            <ul>
              <li>没有存档，关掉页面就从头开始。</li>
              <li>要点过「开始」之后才有声音。</li>
              <li>手机触屏还没在真机上试过。</li>
            </ul>
          </div>
          <button type="button" id="help-close">合上</button>
        </div>
      </div>`;
}

/** 标题页：一行主脊 + 两个出口。开始那一下是首次可信手势，音频在这里建。 */
function titleMarkup(): string {
  return `
      <div class="titlecard" id="titlecard" role="dialog" aria-modal="true" aria-labelledby="title-name">
        <div class="titlecard-card">
          <p class="titlecard-kicker">${CONFIG.subtitle}</p>
          <h2 id="title-name">${CONFIG.title}</h2>
          <p class="titlecard-line" id="titlecard-line">她想找回那晚走过的那条路。<br />雨一改，路就跟着换。</p>
          <div class="titlecard-acts">
            <button type="button" id="btn-start">开始</button>
            <button type="button" id="btn-help-title">怎么玩</button>
          </div>
          <p class="titlecard-foot" id="titlecard-foot">试玩版没有存档，关掉页面就从头开始。</p>
        </div>
      </div>`;
}

export function mount(root: HTMLElement): Game {
  const game = createGame();
  let journalOpen = false;
  /** 上次打开手账时见过的条目签名；有新条目且未打开 → 角标 */
  let journalSeenSig = "";
  let view: View = "explore";
  let detailKind: DetailKind = "result";
  let player = { x: 50, y: 55 };
  let moving = false;
  let lastAt = game.state.at;
  /** 首次重绘也要把当前雨态交给底噪层，故初值故意留空 */
  let lastRain: string | null = null;
  /** 名字从无到有那一刻要单独成节拍，不能只让顶栏悄悄换字 */
  let lastName: string | undefined = game.state.name;
  /** 刚剪完这一剪，正在读客人的回话：剪发条收起，别让「按住落剪」还挂在对话上 */
  let cutJustDone = false;
  /** 结局卡只自动挡一次；合上后还能从手账重看，人也可以继续在城里走 */
  let endingSeen = false;
  /** 结局卡当前是否展开（真相源，重绘不会把它意外关掉） */
  let endingOpen = false;
  /** 标题页合上之前，键盘不参与游戏（指针由覆盖层拦下） */
  let started = false;
  /** 说明页当前是否展开；从标题页和顶栏都能开，合上回到开它的那一层 */
  let helpOpen = false;
  /** 剪发对象的显示名（CUTS 的键 → 台词里的称呼） */
  const CUT_TITLES: Record<string, string> = {
    regular: "常客",
    team: "同伴",
    wet: "滴水的人",
    yu: "陈琛",
  };
  /** 当前底图宽高比；画面框按它定尺寸，热区百分比与图片一一对应 */
  let sceneAspect = 4 / 3;

  root.innerHTML = `
    <div class="shell mode-explore" id="shell" data-view="explore" data-scene-skin="dirty-flat-v7">
      <header class="topbar">
        <div>
          <h1>${CONFIG.title}</h1>
          <p class="who" id="who"></p>
        </div>
        <div class="top-actions">
          <div class="rain-badge" id="rain" aria-live="polite"></div>
          <button type="button" class="help-open" id="btn-help" aria-label="说明">说明</button>
          <button type="button" class="journal-open" id="btn-journal" aria-label="手账">
            手账<span class="journal-dot" id="journal-dot" hidden aria-hidden="true"></span>
          </button>
        </div>
      </header>

      <div class="explore-view" id="explore-view">
        <section class="scene-panel" aria-label="探索场景">
          <div class="scene-stage" id="scene-stage" data-restyle="scene-stage">
            <div class="scene-art-box" id="scene-art-box">
              <img class="scene-art" id="scene-art" alt="" hidden />
              <div class="scene-fallback" id="scene-fallback" hidden></div>
              <div class="scene-spots" id="scene-spots"></div>
              <div class="player" id="player" aria-hidden="true"></div>
            </div>
          </div>
          <div class="explore-footer">
            <p class="scene-hint" id="scene-hint"></p>
            <p class="place-blurb" id="place-blurb"></p>
          </div>
        </section>
      </div>

      <div class="detail-view" id="detail-view" hidden>
        <div class="detail-stage">
          <div class="detail-art-slot" id="detail-art-slot" data-slot="illustration">
            <img class="detail-cg" id="detail-cg" alt="" hidden />
          </div>
          <aside class="detail-panel">
            <img class="detail-portrait" id="detail-portrait" alt="" hidden />
            <p class="detail-k" id="detail-k"></p>
            <p class="detail-body" id="detail-body"></p>
            <div class="cut-box" id="cut" hidden>
              <p id="cut-who"></p>
              <div class="meter" id="meter"><div class="band"></div><div class="fill" id="fill"></div></div>
              <div class="cut-actions">
                <button type="button" id="hold">按住落剪</button>
                <button type="button" id="band-toggle">收起范围</button>
              </div>
            </div>
            <div class="detail-acts" id="detail-acts"></div>
            <button type="button" class="back-explore" id="btn-back-explore">返回移动</button>
          </aside>
        </div>
      </div>

      <button type="button" class="jtab" id="jtab" aria-label="手账">
        手账<span class="journal-dot" id="jtab-dot" hidden aria-hidden="true"></span>
      </button>
      <aside class="journal" id="journal" hidden>
        <h2>手账</h2>
        <div class="sub">还在想</div>
        <ul id="todos"></ul>
        <div class="sub">记下了</div>
        <ul id="known"></ul>
        <button type="button" class="close" id="journal-close">合上手账</button>
        <button type="button" class="close" id="journal-ending" hidden>重看结局</button>
      </aside>
      <div class="ending" id="ending" role="dialog" aria-modal="true" aria-labelledby="ending-title" hidden>
        <div class="ending-card">
          <div class="ending-kicker" id="ending-kicker">这一趟到此</div>
          <h2 id="ending-title">戴上</h2>
          <p class="ending-line" id="ending-line"></p>
          <p class="ending-rings" id="ending-rings"></p>
          <button type="button" id="ending-close">合上，再走一会儿</button>
        </div>
      </div>
      <div class="transit" id="transit" hidden>纸页翻过</div>
      ${helpMarkup()}
      ${titleMarkup()}
    </div>
    <p class="footer">${CONFIG.subtitle} · ${CONFIG.version}</p>
  `;

  const shell = el("shell");
  const rainEl = el("rain");
  const whoEl = el("who");
  const exploreView = el("explore-view");
  const detailView = el("detail-view");
  const sceneStage = el("scene-stage");
  const artBox = el("scene-art-box");
  const sceneArt = el("scene-art") as HTMLImageElement;
  const sceneFallback = el("scene-fallback");
  const sceneSpots = el("scene-spots");
  const sceneHint = el("scene-hint");
  const placeBlurb = el("place-blurb");
  const playerEl = el("player");
  const detailK = el("detail-k");
  const detailBody = el("detail-body");
  const detailActs = el("detail-acts");
  const detailCg = el("detail-cg") as HTMLImageElement;
  const detailPortrait = el("detail-portrait") as HTMLImageElement;
  const cutBox = el("cut");
  const cutWho = el("cut-who");
  const meter = el("meter");
  const fill = el("fill");
  const transit = el("transit");
  const holdBtn = el("hold") as HTMLButtonElement;
  const journal = el("journal");
  const endingLayer = el("ending");
  const endingTitle = el("ending-title");
  const endingKicker = el("ending-kicker");
  const endingLineEl = el("ending-line");
  const endingRingsEl = el("ending-rings");
  const journalEndingBtn = el("journal-ending");
  const titleCard = el("titlecard");
  const helpLayer = el("help");

  function el(id: string): HTMLElement {
    const node = root.querySelector("#" + id);
    if (!node) throw new Error("missing #" + id);
    return node as HTMLElement;
  }

  /**
   * 画面框＝底图比例，居中放进舞台，多余留边。
   * 热区写在画面框内，百分比因此就是图片百分比。
   */
  function layoutArtBox() {
    const stage = sceneStage.getBoundingClientRect();
    if (!stage.width || !stage.height) return;
    let w = stage.width;
    let h = w / sceneAspect;
    if (h > stage.height) {
      h = stage.height;
      w = h * sceneAspect;
    }
    artBox.style.width = Math.round(w) + "px";
    artBox.style.height = Math.round(h) + "px";
  }

  function acts(): Act[] {
    return game.actionsFor() as Act[];
  }

  function setView(next: View) {
    view = next;
    shell.dataset.view = next;
    shell.classList.toggle("mode-explore", next === "explore");
    shell.classList.toggle("mode-detail", next === "detail");
    exploreView.hidden = next !== "explore";
    detailView.hidden = next !== "detail";
  }

  /** 插图可缺：有图占左栏，无图整栏收起、正文居中。 */
  function setDetailVisual(cg: string | null, portrait: PortraitId | "none" | null) {
    detailView.classList.toggle("no-art", !cg);
    if (cg) {
      detailCg.src = cg;
      detailCg.hidden = false;
    } else {
      detailCg.removeAttribute("src");
      detailCg.hidden = true;
    }
    const path = portrait && portrait !== "none" ? portraitPath(portrait) : null;
    if (path) {
      detailPortrait.src = path;
      detailPortrait.hidden = false;
    } else {
      detailPortrait.removeAttribute("src");
      detailPortrait.hidden = true;
    }
  }

  function clearActs() {
    detailActs.innerHTML = "";
  }

  function addActBtn(label: string, onClick: () => void, className = "") {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (className) b.className = className;
    b.addEventListener("click", () => {
      playCue("tap");
      onClick();
    });
    detailActs.appendChild(b);
  }

  function enterExplore() {
    setView("explore");
    detailKind = "result";
    cutBox.hidden = true;
    clearActs();
    paintScene();
  }

  function openDetail(opts: {
    kind: DetailKind;
    title: string;
    body: string;
    cg?: string | null;
    portrait?: PortraitId | "none" | null;
  }) {
    detailKind = opts.kind;
    cutJustDone = false;
    setView("detail");
    detailK.textContent = opts.title;
    detailBody.textContent = opts.body;
    setDetailVisual(opts.cg ?? null, opts.portrait ?? null);
    syncCut();
    playCue("paperOpen");
  }

  function showResult(label: string, kind: string) {
    const isObs = kind === "observe";
    const pid = isObs ? "none" : portraitForAction(label);
    clearActs();
    openDetail({
      kind: isObs ? "observe" : "result",
      title: isObs ? "观察" : pid !== "none" ? "对白" : "行动",
      body: game.state.log || "……",
      cg: isObs ? observeArtFor(label) : null,
      portrait: pid,
    });
  }

  function openHub(spot: SceneSpot) {
    const prefixes = spot.hubPrefixes || [];
    const hubActs = acts().filter((a) => prefixes.some((p) => a.label.startsWith(p)));
    clearActs();
    hubActs.forEach((a) => {
      addActBtn(
        a.label,
        () => {
          a.fn();
          showResult(a.label, "verb");
        },
        a.ghost ? "ghost" : "go"
      );
    });
    openDetail({
      kind: "hub",
      title: spot.label,
      body: "雨会改路。在椅子上等到你要的那场。",
      cg: null,
      portrait: "chen",
    });
  }

  function openChen() {
    const list = acts().filter((a) => isDialogueHook(a.label));
    clearActs();
    list.forEach((a) => {
      addActBtn(a.label, () => runAction(a), a.ghost ? "ghost" : "");
    });
    let body = game.state.log || "光头理发师看着你。";
    // 只剩闲话（ghost）时也要给导航提示，别让人对着一个空面板发呆
    const realHooks = list.filter((a) => !a.ghost).length;
    if (game.activeCut()) {
      body += "\n\n有人坐在椅子上。按住「按住落剪」，松手停住。";
    } else if (!realHooks) {
      body += "\n\n等雨去窗边的椅子。出门从门口走。";
    }
    openDetail({
      kind: "talk",
      title: "陈琛",
      body,
      cg: null,
      portrait: "chen",
    });
    syncCut();
  }

  function runAction(a: Act) {
    const kind = classifyLabel(a.label);
    if (kind === "exit") {
      pageTurn(() => a.fn());
      return;
    }
    const before = game.state.log;
    const hadEnding = !!game.endingSnapshot();
    a.fn();
    // 这一步把结局走出来了：结局卡已经承载那段文字，不再叠一张详情卡在最底下
    if (!hadEnding && game.endingSnapshot()) return;
    if (kind === "verb" && game.activeCut() && game.state.log === before) {
      clearActs();
      openDetail({
        kind: "cut",
        title: "理发",
        body: game.CUTS[game.activeCut()!].who,
        cg: null,
        portrait: "chen",
      });
      syncCut();
      return;
    }
    showResult(a.label, kind);
  }

  function syncCut() {
    const cutId = game.activeCut();
    const show =
      !!cutId &&
      view === "detail" &&
      (detailKind === "cut" || (detailKind === "talk" && !cutJustDone));
    cutBox.hidden = !show;
    if (cutId && show) {
      cutWho.textContent = game.CUTS[cutId].who;
      fill.style.width = game.cutProgress() + "%";
      meter.classList.toggle("hide-band", !!game.state.hideBand);
      el("band-toggle").textContent = game.state.hideBand ? "显示范围" : "收起范围";
    }
  }

  function movePlayerTo(x: number, y: number, then?: () => void) {
    player = { x, y };
    playerEl.style.left = x + "%";
    playerEl.style.top = y + "%";
    if (!then) return;
    if (moving) {
      then();
      return;
    }
    moving = true;
    window.setTimeout(() => {
      moving = false;
      then();
    }, 160);
  }

  function pageTurn(then: () => void) {
    transit.hidden = false;
    transit.classList.add("show");
    playCue("pageTurn");
    window.setTimeout(() => {
      then();
      // 进店开场等会在 paint 里切详情；勿盖掉
      if (view !== "detail") enterExplore();
      window.setTimeout(() => {
        transit.classList.remove("show");
        transit.hidden = true;
      }, 60);
    }, CONFIG.transitionMs * 0.4);
  }

  type LiveSpot = SceneSpot & {
    act?: Act;
    dynamic?: boolean;
    locked?: boolean;
    hasHook?: boolean;
  };

  function visibleSpots(sceneNode: ReturnType<typeof sceneFor>): LiveSpot[] {
    const all = acts();
    const out: LiveSpot[] = [];
    const claimed = new Set<string>();
    const npcSpot = sceneNode.spots.find((s) => s.kind === "npc");
    const hooks = npcSpot ? all.filter((a) => isDialogueHook(a.label)) : [];

    for (const spot of sceneNode.spots) {
      if (spot.kind === "hub" && spot.hubPrefixes?.length) {
        const hubActs = all.filter((a) =>
          spot.hubPrefixes!.some((p) => a.label.startsWith(p))
        );
        if (hubActs.length) {
          out.push(spot);
          hubActs.forEach((a) => claimed.add(a.label));
        }
        continue;
      }
      if (spot.kind === "npc" && spot.id === "H-chen") {
        out.push({ ...spot, hasHook: hooks.length > 0 });
        continue;
      }
      if (spot.labelExact || spot.labelPrefix) {
        const act = all.find((a) => spotCoversLabel(spot, a.label));
        if (act) {
          out.push({ ...spot, act });
          claimed.add(act.label);
        } else if (spot.lockTeach) {
          out.push({ ...spot, locked: true });
        }
      }
    }

    // 店内有人坐下：探索面给出落剪入口（不必猜点陈琛）
    if (sceneNode.nodeId === "H" && game.activeCut()) {
      out.push({
        id: "H-cut",
        kind: "verb",
        label: "理发",
        x: 50,
        y: 58,
        r: 8,
      });
    }

    // 未入表动作：贴在 loose 锚点旁，不扇形铺满场景
    let extra = 0;
    all.forEach((a) => {
      if (claimed.has(a.label)) return;
      if (a.label.startsWith("等到") && sceneNode.spots.some((s) => s.kind === "hub")) return;
      if (npcSpot && isDialogueHook(a.label)) return; // 对白钩子只在陈琛身上出
      const ox = (extra % 3) * 6 - 6;
      const oy = Math.floor(extra / 3) * 7;
      extra++;
      out.push({
        id: "dyn-" + a.label,
        kind: classifyLabel(a.label) as SceneSpot["kind"],
        label: a.label,
        x: Math.max(8, Math.min(92, sceneNode.loose.x + ox)),
        y: Math.max(10, Math.min(88, sceneNode.loose.y + oy)),
        r: 5,
        act: a,
        dynamic: true,
      });
    });
    return out;
  }

  /** 锁态教学：路被关掉和还没资格做的选择走同一条出口，标题按实际语义给。 */
  function openLockTeach(spot: SceneSpot) {
    clearActs();
    playCue("edgeOpen");
    openDetail({
      kind: "result",
      title: spot.lockTitle || "过不去",
      body: spot.lockTeach || "现在过不去。",
      cg: null,
      portrait: null,
    });
  }

  function openCutSeat() {
    const cutId = game.activeCut();
    if (!cutId) return;
    clearActs();
    openDetail({
      kind: "cut",
      title: "理发",
      body: game.CUTS[cutId].who + "\n\n按住「按住落剪」，松手停住。",
      cg: null,
      portrait: "chen",
    });
    syncCut();
  }

  /**
   * 松手收尾：真剪下这一剪就收起剪发条，直接把客人的回话当对话呈现。
   * 剪发信息（「雨一变，路就变」「队在找你」）本来就在这一句里，不该只沉进手账。
   */
  function releaseHold(commit: boolean) {
    if (!game.isHolding()) return;
    const cutId = game.activeCut();
    const before = game.state.log;
    if (commit) game.stopHold();
    else game.stopHold(false);
    if (!commit || !cutId || game.state.log === before) {
      syncCut();
      return;
    }
    playCue("cutSnip");
    clearActs();
    openDetail({
      kind: "talk",
      title: CUT_TITLES[cutId] || "客人",
      body: game.state.log,
      cg: null,
      portrait: "chen",
    });
    cutJustDone = true;
    syncCut();
  }

  function onSpot(spot: LiveSpot) {
    movePlayerTo(spot.x, spot.y, () => {
      if (spot.locked && spot.lockTeach) {
        openLockTeach(spot);
        return;
      }
      if (spot.id === "H-cut") {
        openCutSeat();
        return;
      }
      if (spot.kind === "hub") {
        openHub(spot);
        return;
      }
      if (spot.kind === "npc" && spot.id === "H-chen") {
        openChen();
        return;
      }
      if (spot.act) {
        runAction(spot.act);
        return;
      }
      enterExplore();
    });
  }

  /** 顶栏名字亮一下：类名挂在 who 上，shell 的 className 每帧被重写，不能放那儿 */
  function flashWho() {
    whoEl.classList.remove("who-known");
    // 强制重排，连续两次触发也能重新播放动画
    void whoEl.offsetWidth;
    whoEl.classList.add("who-known");
    window.setTimeout(() => whoEl.classList.remove("who-known"), 3200);
  }

  /** 结局收口：按 endingOpen 画内容与可见性（纯函数，不改标志）。 */
  function paintEnding() {
    const snap = game.endingSnapshot();
    journalEndingBtn.hidden = !snap;
    endingLayer.hidden = !snap || !endingOpen;
    if (!snap) return;
    endingTitle.textContent = snap.title;
    endingKicker.textContent =
      snap.mode === "wear" ? "这一趟到此 · 你把自己交了出去" : "这一趟到此 · 你带着缺口走了";
    endingLineEl.textContent = snap.line;
    endingRingsEl.textContent = "这一趟你碰过的事：" + snap.rings + " / " + snap.total + "。";
  }

  /** 结局从无到有那一次：自动挡上卡片，底下退回探索面，合上后落在场景里。 */
  function revealEnding() {
    endingSeen = true;
    endingOpen = true;
    if (view === "detail") enterExplore();
    paintEnding();
    playCue("pageTurn");
    (el("ending-close") as HTMLButtonElement).focus();
  }

  function closeEnding() {
    endingOpen = false;
    paintEnding();
  }

  function paintExploreChrome() {
    const scene = sceneFor(game.state.at);
    const [title, text] = game.placeCopy();
    sceneHint.textContent =
      "点地面移动 · 点圆点互动 · " + game.rainName() + " · " + title;
    placeBlurb.textContent = (scene.blurb ? "【" + scene.blurb + "】\n" : "") + text;
  }

  function paintScene() {
    const scene = sceneFor(game.state.at);
    const [title] = game.placeCopy();
    const art = scene.artId ? artUrl(scene.artId) : null;
    const size = scene.artId ? artSize(scene.artId) : null;
    sceneAspect = size ? size.w / size.h : 4 / 3;
    sceneStage.style.setProperty("--scene-bg", art ? "url(" + art + ")" : "none");
    const p = scene.palette;
    shell.style.setProperty("--scene-frame", p.frame);
    shell.style.setProperty("--scene-void", p.void);
    shell.style.setProperty("--scene-hint-bg", p.hintBg);
    shell.style.setProperty("--scene-hint-fg", p.hintFg);
    layoutArtBox();

    if (art) {
      sceneArt.src = art;
      sceneArt.alt = title;
      sceneArt.hidden = false;
      sceneFallback.hidden = true;
      sceneFallback.textContent = "";
      sceneFallback.className = "scene-fallback";
    } else {
      sceneArt.hidden = true;
      sceneArt.removeAttribute("src");
      sceneFallback.hidden = false;
      sceneFallback.className = "scene-fallback scene-fallback-" + scene.nodeId;
      sceneFallback.innerHTML =
        "<div class=\"fb-title\">" +
        title +
        "</div><div class=\"fb-blurb\">" +
        scene.blurb +
        "</div>";
    }

    if (playerEl.dataset.at !== game.state.at) {
      player = { ...scene.spawn };
      playerEl.dataset.at = game.state.at;
      playerEl.style.left = player.x + "%";
      playerEl.style.top = player.y + "%";
    }

    paintExploreChrome();

    sceneSpots.innerHTML = "";
    if (view !== "explore") return;

    visibleSpots(scene)
      .forEach((spot) => {
        const label = spot.locked ? spot.label + "（关）" : spot.label;
        const b = document.createElement("button");
        b.type = "button";
        b.className =
          "spot spot-" +
          spot.kind +
          (spot.dynamic ? " spot-dyn" : "") +
          (spot.locked ? " spot-locked" : "") +
          (spot.hasHook ? " spot-has-hook" : "") +
          (spot.act?.ghost ? " ghost" : "");
        b.style.left = spot.x + "%";
        b.style.top = spot.y + "%";
        if (spot.x > 82) b.classList.add("spot-flip");
        if (spot.y < 9) b.classList.add("spot-below");
        b.dataset.label = label;
        b.setAttribute(
          "aria-label",
          spot.locked
            ? spot.label + "，现在过不去"
            : spot.hasHook
              ? spot.label + "，有话可问"
              : spot.label
        );
        const tip = document.createElement("span");
        tip.className = "spot-label";
        tip.textContent = label;
        tip.setAttribute("aria-hidden", "true");
        b.appendChild(tip);
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          // 先给一下敲击：位移与开纸都有延迟，反馈必须落在点的那一帧
          playCue("tap");
          onSpot(spot);
        });
        sceneSpots.appendChild(b);
      });
  }

  function paint() {
    const s = game.state;
    shell.className =
      "shell " +
      (view === "explore" ? "mode-explore" : "mode-detail") +
      " " +
      (RAIN_CLASS[s.rain] || "");
    shell.dataset.view = view;
    rainEl.textContent = "现在：" + game.rainName();
    whoEl.textContent = s.name ? s.name : "她还不知道自己的名字";

    if (s.rain !== lastRain) {
      lastRain = s.rain;
      setRainAmbience(s.rain as RainSoundId);
    }

    // 找回名字：顶栏亮一下 + 全屏卡片，让这一刻和别的到站描述区分开
    if (s.name && s.name !== lastName) {
      lastName = s.name;
      flashWho();
      playCue("nameBack");
      if (view === "explore") {
        clearActs();
        openDetail({
          kind: "result",
          title: "想起一个名字",
          body: s.log || "雨把一段记忆淋开在脚边。你叫" + s.name + "。",
          cg: null,
          portrait: "yuzhen",
        });
      }
    }

    // 进店首次：自动进详情读陈琛开场（仍可返回移动）
    if (s.at !== lastAt) {
      const enteredH = s.at === "H" && lastAt !== "H" && s.seenChen;
      lastAt = s.at;
      if (enteredH && view === "explore") {
        clearActs();
        openDetail({
          kind: "talk",
          title: "陈琛",
          body: s.log || "光头理发师看着你。",
          cg: null,
          portrait: "chen",
        });
      }
    }

    paintScene();

    const snap = game.journalSnapshot();
    fillList("todos", snap.todos);
    fillList("known", snap.known);
    syncJournalBadge(snap);

    // 结局从无到有那一次自动挡上卡片；之后每次重绘只按展开状态刷新
    if (game.endingSnapshot() && !endingSeen) revealEnding();
    else paintEnding();

    if (view === "detail") {
      syncCut();
      fill.style.width = game.cutProgress() + "%";
    }
  }

  function journalSig(snap: { todos: string[]; known: string[] }): string {
    return snap.todos.join("\n") + "||" + snap.known.join("\n");
  }

  function setJournalUnread(on: boolean) {
    const dot = el("journal-dot");
    const tabDot = el("jtab-dot");
    const btn = el("btn-journal");
    const tab = el("jtab");
    dot.hidden = !on;
    tabDot.hidden = !on;
    btn.classList.toggle("has-unread", on);
    tab.classList.toggle("has-unread", on);
    if (on) {
      btn.setAttribute("aria-label", "手账（有新内容）");
      tab.setAttribute("aria-label", "手账（有新内容）");
    } else {
      btn.setAttribute("aria-label", "手账");
      tab.setAttribute("aria-label", "手账");
    }
  }

  function syncJournalBadge(snap: { todos: string[]; known: string[] }) {
    const sig = journalSig(snap);
    if (journalOpen) {
      journalSeenSig = sig;
      setJournalUnread(false);
      return;
    }
    setJournalUnread(sig !== journalSeenSig && sig !== "||");
  }

  function fillList(id: string, items: string[]) {
    const ul = el(id);
    if (!items.length) {
      ul.innerHTML = '<li class="empty">还没有</li>';
      return;
    }
    ul.innerHTML = items
      .map(
        (t) =>
          "<li>" +
          t.replace(
            /[&<>"']/g,
            (c) =>
              ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
          ) +
          "</li>"
      )
      .join("");
  }

  function setJournal(next: boolean) {
    journalOpen = next;
    journal.hidden = !journalOpen;
    if (journalOpen) {
      journalSeenSig = journalSig(game.journalSnapshot());
      setJournalUnread(false);
    }
    playCue(journalOpen ? "journalOpen" : "paperClose");
  }

  /** 说明页是纯阅读层：合上回到开它的那一层，标题页没开始就一直还在底下。 */
  function setHelp(next: boolean) {
    helpOpen = next;
    helpLayer.hidden = !helpOpen;
    playCue(helpOpen ? "journalOpen" : "paperClose");
    if (helpOpen) (el("help-close") as HTMLButtonElement).focus();
  }

  /**
   * 开始那一下：合掉标题页，同时把这次可信手势交给音频层建 AudioContext。
   * 标题页上按「怎么玩」也会先建好声音，说明页翻纸才听得到。
   */
  function startGame() {
    if (started) return;
    started = true;
    titleCard.hidden = true;
    setChromeInert(false);
    playCue("paperOpen");
  }

  /**
   * 标题页期间把底下几层收成交互：覆盖层只挡指针，Tab 还能跑到「手账」上，
   * 按回车会开一张压在标题页下面的纸——看着像没反应。inert 连焦点一起挡掉。
   */
  function setChromeInert(on: boolean) {
    const layers = [shell.querySelector(".topbar"), exploreView, detailView, el("jtab"), journal];
    for (const node of layers) {
      if (!node) throw new Error("壳内层缺失：无法按开始状态收放交互");
      (node as HTMLElement).inert = on;
    }
  }

  sceneStage.addEventListener("click", (e) => {
    if (view !== "explore") return;
    const t = e.target as HTMLElement;
    if (t.closest(".spot")) return;
    if (
      t !== artBox &&
      t !== sceneArt &&
      t !== sceneFallback &&
      !sceneFallback.contains(t)
    ) {
      return;
    }
    const rect = artBox.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    playCue("tap");
    movePlayerTo(Math.max(8, Math.min(92, x)), Math.max(10, Math.min(90, y)));
  });

  el("btn-back-explore").addEventListener("click", () => {
    playCue("paperClose");
    enterExplore();
  });
  window.addEventListener("resize", () => {
    if (view === "explore") layoutArtBox();
  });
  el("btn-journal").addEventListener("click", () => setJournal(!journalOpen));
  el("btn-help").addEventListener("click", () => setHelp(!helpOpen));
  el("help-close").addEventListener("click", () => setHelp(false));
  el("btn-start").addEventListener("click", () => startGame());
  el("btn-help-title").addEventListener("click", () => setHelp(true));
  el("jtab").addEventListener("click", () => setJournal(true));
  el("journal-close").addEventListener("click", () => setJournal(false));
  el("band-toggle").addEventListener("click", () => game.setHideBand(!game.state.hideBand));
  el("ending-close").addEventListener("click", () => closeEnding());
  journalEndingBtn.addEventListener("click", () => {
    endingOpen = true;
    paintEnding();
    (el("ending-close") as HTMLButtonElement).focus();
  });
  holdBtn.addEventListener("pointerdown", (e) => game.startHold(e));
  holdBtn.addEventListener("pointerup", () => releaseHold(true));
  // 指针被系统打断不算剪下：这一剪作废，别把打断当成松手 commit
  holdBtn.addEventListener("pointercancel", () => releaseHold(false));

  window.addEventListener("keydown", (e) => {
    // 标题页盖在最上层：指针由覆盖层拦下，键盘也不能绕过
    if (!started) return;
    if (e.code === CONFIG.keys.journal && !e.repeat) {
      e.preventDefault();
      setJournal(!journalOpen);
    } else if (e.code === "Space" && !e.repeat) {
      if (view !== "detail" || cutBox.hidden) return;
      e.preventDefault();
      game.startHold();
    } else if (e.code === "Escape") {
      // 谁在最上层，Esc 先关谁
      if (helpOpen) setHelp(false);
      else if (endingOpen) closeEnding();
      else if (journalOpen) setJournal(false);
      else if (view === "detail") enterExplore();
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "Space" && game.isHolding()) {
      e.preventDefault();
      releaseHold(true);
    }
  });

  setView("explore");
  setChromeInert(true);
  game.subscribe(() => paint());
  return game;
}
