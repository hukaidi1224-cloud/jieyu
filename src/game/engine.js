/** Auto-derived from act1 greybox; DOM-free game engine. */
export function createGame() {
  let onChange = () => {};

const NODES = [
  { id: "S", name: "湿巷起点", zone: "开场" },
  { id: "H", name: "理发店内", zone: "H" },
  { id: "A1", name: "店门廊", zone: "A" },
  { id: "A2", name: "巷中", zone: "A" },
  { id: "A3", name: "巷尾", zone: "A" },
  { id: "C0", name: "深层口外", zone: "C" },
  { id: "C1", name: "深层口内", zone: "C" },
  { id: "B1", name: "城寨口", zone: "B" },
  { id: "B2", name: "楼梯 1–7", zone: "B" },
  { id: "B3", name: "七楼转角", zone: "B" },
  { id: "B4", name: "八楼潮底踏", zone: "B" },
  { id: "E0", name: "工地围挡", zone: "E" },
  { id: "E1", name: "空街", zone: "E" },
  { id: "E2", name: "窗边", zone: "E" },
  { id: "E3", name: "无门走廊", zone: "E" }
];

const state = {
  at: "S",
  rain: "mid",
  seenChen: false,
  sawWall: false,
  sawMold: false,
  fragment: false,
  knowRain: false,
  knowFold: false,
  sawDoor: false,
  sawNumber: false,
  knowId: false,
  sawHelmet: false,
  knowStorm: false,
  readMold: false,
  scrapsSpawned: false,
  hasD1: false,
  hasD2: false,
  knowHeaven: false,
  heardTaboo: false,
  regularFact: false,
  regularLeft: false,
  yuCut: false,
  yuRefused: false,
  cuttingYu: false,
  teamFact: false,
  teamLeft: false,
  sawWet: false,
  knowHumid: false,
  wetFact: false,
  wetLeft: false,
  knowChoice: false,
  sawPoster: false,
  readWindow: false,
  corridorOpen: false,
  ending: "",
  /** 尾声短景只给一次（节点走向 L65「可选店内尾声短景」），不让人反复刷 */
  epilogueRead: false,
  /** 闲话轮换位：连着点陈琛不该听到同一句 */
  chenIdle: 0,
  /** 结局那一段在发生时存下来：手账之后还会写别的，不能靠 state.log 回读 */
  endingLine: "",
  helmetOnCounter: false,
  readAlley: false,
  readFrame: false,
  readCloth: false,
  readGate: false,
  readGap: false,
  readStreet: false,
  readFork: false,
  readStepDry: false,
  passedMid: false,
  passedHumid: false,
  enteredC1: false,
  enteredE1: false,
  enteredE2: false,
  hideBand: false,
  name: "",
  visited: { S: true },
  // 旁环 α～ι
  sawBox: false,
  knowCut: false,
  alphaDone: false,
  sawBook: false,
  betaDone: false,
  sawCabinet: false,
  gammaDone: false,
  sawTicket: false,
  deltaDone: false,
  deltaRefused: false,
  sawRoots: false,
  heardRootWarn: false,
  epsilonDone: false,
  sawLetter: false,
  zetaDone: false,
  sawGreenBox: false,
  etaDone: false,
  thetaDone: false,
  iotaDone: false,
  log: "雨衣还在滴。没有盔。墙上的霉发亮，指向一间还亮着灯的店。"
};

const CUT_LO = 40;
const CUT_HI = 68;
let holding = false;
let cutValue = 0;
let cutRaf = 0;
let cutStarted = 0;
let chairId = null;

const RAIN_LABEL = { mid: "中雨", clear: "晴", storm: "暴雨", humid: "回南天" };
const RAIN_CLASS = { mid: "rain", clear: "clear", storm: "storm", humid: "humid" };

function rainName() { return RAIN_LABEL[state.rain]; }
function alleyOpen() { return state.rain === "mid" || state.rain === "humid"; }

function setLog(text) { state.log = text; }

function syncRead() {
  if (state.passedMid) state.knowRain = true;
  if (state.passedHumid) state.knowHumid = true;
}

function learnFold() {
  state.fragment = true;
  state.knowFold = true;
  state.name = "林玉真";
  setLog("雨把一段记忆淋开在脚边。你叫林玉真。当晚从这层跑过。盔不在。人还往更深的地方去过。没有地名。");
}

function onEnter(id, from) {
  if (id === "H" && !state.seenChen) {
    state.seenChen = true;
    state.rain = "clear";
    setLog("光头理发师打量你的雨衣和护肘，目光在头顶空了一拍。「你们那伙的头盔呢？」你答不上来。他也不追问，只指了指门口的雨：「你进来那会儿还是中雨尾巴。巷尾那时有过门洞，现在晴了，就没了。」他把自己那把椅子朝窗边转了半圈：「店里的徽章比天准。想换哪场雨，自己坐下等。」");
  } else if (id === "B1" && from === "A3" && state.rain === "mid") {
    state.passedMid = true;
    syncRead();
    setLog(state.readAlley ? "门洞开着。墙根那截潮，被雨重新写湿了。" : "门洞开着。握手楼挤在对面。");
  } else if (id === "B1" && from === "A3" && state.rain === "humid") {
    state.passedHumid = true;
    state.sawWet = true;
    syncRead();
    setLog(state.knowHumid ? "湿门印通着。天像晴了，可路还是潮的。往上的楼梯像少了一截。" : "你从湿门印走进来了。天像晴了，靴底却还湿。");
  } else if (id === "B4" && !state.fragment) {
    learnFold();
  } else if (id === "C1") {
    state.enteredC1 = true;
  } else if (id === "E1") {
    state.enteredE1 = true;
  } else if (id === "E2") {
    state.enteredE2 = true;
  } else if (id === "E3" && !state.ending) {
    setLog("电梯停在 0。走廊没有门。尽头放着一顶盔——你少的那顶，或者很像。");
  }
}

function go(id) {
  const from = state.at;
  if (from === "H" && id !== "H") stopHold(false);
  state.at = id;
  state.visited[id] = true;
  onEnter(id, from);
  render();
}

function canGo(from, to) {
  if (from === to) return false;
  const mid = state.rain === "mid";
  const storm = state.rain === "storm";
  const humid = state.rain === "humid";
  const key = from + "|" + to;
  const open = {
    "S|H": true,
    "H|A1": true,
    "A1|H": true,
    "A1|A2": true,
    "A1|C0": true,
    "A1|E0": true,
    "A2|A1": true,
    "A2|A3": true,
    "A3|A2": true,
    "A3|B1": mid || humid,
    "B1|A3": alleyOpen(),
    "B1|B2": true,
    "B1|C0": true,
    "B2|B1": true,
    "B2|B3": true,
    "B3|B2": true,
    "B3|B4": mid && state.sawMold,
    "B4|B3": true,
    "C0|A1": true,
    "C0|B1": true,
    "C0|C1": storm,
    "C1|C0": true,
    "E0|A1": true,
    "E0|E1": mid,
    "E1|E0": mid,
    "E1|E2": storm,
    "E2|E1": storm,
    "E2|E3": state.corridorOpen,
    "E3|E2": true
  };
  return !!open[key];
}

function ringCount() {
  return ["alphaDone","betaDone","gammaDone","deltaDone","epsilonDone","zetaDone","etaDone","thetaDone","iotaDone"]
    .filter(k => state[k]).length;
}

/** 结局收口要读的那一份：没走到结局返回 null。 */
function endingSnapshot() {
  if (!state.ending) return null;
  return {
    mode: state.ending,
    title: state.ending === "wear" ? "戴上" : "不戴",
    line: state.endingLine || state.log,
    rings: ringCount(),
    total: 9,
  };
}
/**
 * 盔前的分档写法（策划案 §8.3b 可漏差：摊牌、盔前、对城的理解要有明显差别）。
 * 每环半句走「更深读法」，不加新 UI：做满的人读到的盔前那段更长、也更具体。
 * wear＝把自己交给编制；leave＝带着缺口自己走。同一件事在两种选择里读法相反。
 */
const RING_ECHO = {
  alphaDone: {
    wear: "表上 07 那一格空着。戴上之后，你觉得那格是在等你。",
    leave: "07 那一格还空着。你没去填它。",
  },
  betaDone: {
    wear: "「未归」你见过怎么写了。名单可以一直往下加。",
    leave: "有人落在「未归」里。你不想变成账上的一个词。",
  },
  gammaDone: {
    wear: "空白成绩栏在眼前晃了一下，等你填。",
    leave: "那张表仍是空的。",
  },
  deltaDone: {
    wear: "门缝那只粮票你用完了。里面的人不必再露面。",
    leave: "门缝的粮票还在你兜里。里面的人继续不露面。",
  },
  epsilonDone: {
    wear: "气根会找热。站着不动的人就是热的来源。",
    leave: "你从积水里走开。气根找的热不是你。",
  },
  zetaDone: {
    wear: "湿信里那句测绘嘱咐，对上了这口气。",
    leave: "那句嘱咐你留下了。它不是命令，是有人等你回来。",
  },
  etaDone: {
    wear: "避雨人说的路，你这次不问了。戴上的人不问路。",
    leave: "避雨人不给路。你自己慢慢找。",
  },
  thetaDone: {
    wear: "塔吊上的鸟巢还在潮底。",
    leave: "空街的塔吊还在。",
  },
  iotaDone: {
    wear: "陈琛说迷茫不能剪。你戴上盔，等于同意把迷茫留在外面。",
    leave: "迷茫没被剪掉。它跟着你下楼。",
  },
};

/** 按做满程度收束：全漏只走了该走的那条，做满才是自己数着做的决定。 */
function ringTier(mode) {
  const n = ringCount();
  if (n >= 7) {
    return mode === "wear"
      ? "这些你一件件都碰过。现在这顶盔，是你自己数着戴上的。"
      : "这些你一件件都碰过。把盔留下，是你数着做的决定。";
  }
  if (n >= 3) {
    return mode === "wear"
      ? "有几件事你不该只听见一次。你没再想，把盔扣上了。"
      : "有几件事你不该只听见一次。你想起了它们，才说得出不戴。";
  }
  return mode === "wear"
    ? "这趟你只走了该走的那条。城里别的东西还在原处，你不知道。"
    : "你想起来的还很少。缺口比你以为的大。";
}

/** 拼盔前那段：基句 + 命中的环半句（按环序，稳定可测） + 分档收束。 */
function endingLine(mode, base) {
  const echoes = Object.keys(RING_ECHO)
    .filter((k) => state[k] && RING_ECHO[k][mode])
    .map((k) => RING_ECHO[k][mode]);
  return [base, ...echoes, ringTier(mode)].join("");
}

/** 手账里那句按做满程度收（玉真自己的口气，不是第二人称旁白）。 */
function ringNote(mode) {
  const n = ringCount();
  if (n >= 7) {
    return mode === "wear"
      ? "九桩事我都碰过，还是戴上了。这一条是我自己数的。"
      : "九桩事我都碰过。数完之后，我把盔留下了。";
  }
  if (n >= 3) {
    return mode === "wear"
      ? "有几件事我只听见一次就扣上了盔。本子还开着。"
      : "有几件事我听见了。就为这几件，我说得出不戴。";
  }
  return mode === "wear"
    ? "我只走了该走的那条。别的还在城里，我不知道。"
    : "想起来的东西太少。缺口比我以为的大。";
}

/**
 * 陈琛闲话池（策划案 §〇「店闲城挖」、文案风格 §一「回店说话有人味」）。
 * 口径：陈琛短，不指路，钥匙半句从人嘴里来；按局面筛掉不该说的，再轮换着出。
 */
function chenIdlePool() {
  const pool = [
    "他把剪刀擦了一遍，没抬头：「今天没别人。」",
    "他照了照你的雨衣，说：「湿的都一个样。」",
    "他在数窗台那本账的页角，数到第三遍，没数完。",
    "他把毛巾拧干，搭回架子上，动作很慢。",
  ];
  if (state.rain === "storm") pool.push("他朝门外努了努嘴：「这场雨会把路改写。」");
  if (state.rain === "humid") pool.push("他摸了一把墙皮：「潮到这份上，谁都别急着走。」");
  if (state.rain === "mid") pool.push("他说：「巷尾这会儿有门洞。怎么找，别问我。」");
  if (state.rain === "clear") pool.push("他把椅子转出来自己坐下：「晴了也没人来。」");
  if (state.name) pool.push("他听见你说出自己名字的时候，手上停了一下：「记得住就好。」");
  if (state.knowId) pool.push("他又看了一眼那块湿布：「07 不归我管。」");
  if (state.knowHeaven) pool.push("他说：「那种地方，我剃过头的人去过两个。回来一个。」");
  if (state.iotaDone) pool.push("他揉着手腕，没再说那句——这话他说过一次了。");
  if (state.ending === "wear") pool.push("他看着你扣盔的样子，揉着手腕说：「口气回来了。」");
  if (state.ending === "leave")
    pool.push("他把盔留在柜台上，说：「你没戴。行。」然后把毛巾拧干。");
  return pool;
}

function chenIdleLine() {
  const pool = chenIdlePool();
  const line = pool[state.chenIdle % pool.length];
  state.chenIdle = (state.chenIdle + 1) % 9973;
  return line;
}

/**
 * 店内尾声短景（节点走向 L65「（可选）店内尾声短景」／可读版 L86「店里可以再坐一次」）。
 * 只给一次：它是收束，不是可以反复刷的内容。按结局与做满程度分档。
 */
function epilogueLine() {
  const wear = state.ending === "wear";
  const base = wear
    ? "你坐回等雨的那把椅子。椅面还是潮的。陈琛没问你去哪——他知道你要去标坐标，今晚就得开始。"
    : "你坐回等雨的那把椅子。柜台上那顶盔还在，没人去动它。陈琛把毛巾拧干，说：「雨还会换。」你没答。";
  const n = ringCount();
  if (n >= 7) {
    return base + (wear
      ? "你数过的那几件事都跟着你上了路。它们不会替你标坐标。"
      : "你数过的那几件事留在城里。你带走的是仍然想不起来的那部分。");
  }
  if (n <= 2) {
    return base + (wear
      ? "椅子空着的时候，你想起的东西更少。要标的那些坐标，你还说不出几个。"
      : "你想起来的还少。走出这家店，缺口跟着你走。");
  }
  return base + (wear
    ? "有几件事你只听见了一次。它们今晚会被你忘在椅背上。"
    : "有几件事你听见了。你记得住哪几件，就算这趟没白走。");
}

function say(text) {
  setLog(text);
  render();
}

function zoneOf(value) {
  if (value < CUT_LO) return "short";
  if (value > CUT_HI) return "long";
  return "ok";
}

function nextGuest() {
  if (state.knowRain && !state.regularLeft) return "regular";
  if (state.knowId && !state.teamLeft) return "team";
  if (state.knowHumid && !state.wetLeft) return "wet";
  return null;
}

function seatedGuest() {
  if (state.at !== "H" || state.cuttingYu) return null;
  if (chairId === "regular" && !state.regularLeft) return chairId;
  if (chairId === "team" && !state.teamLeft) return chairId;
  if (chairId === "wet" && !state.wetLeft) return chairId;
  chairId = nextGuest();
  return chairId;
}

function activeCut() {
  if (state.at !== "H") return null;
  if (state.cuttingYu) return "yu";
  return seatedGuest();
}

const CUTS = {
  regular: {
    who: "常客坐下。他要剪成能出门见人的样子。按住落剪，松手停住。",
    short: "头发还是有点乱。他照了照镜子：「雨一变，路就变。」像在说天气，又像在说这座城。",
    ok: "他松了口气，拍拍肩：「雨一变，路就变。」说完就走，不告诉你往哪走。",
    long: "他摸摸太短的头发，苦笑：「雨一变，路就变。」门在身后合上。",
    skip: "你没按。常客在门口甩了甩袖：「雨一变，路就变。」",
    done() { state.regularFact = true; },
    leave() { state.regularLeft = true; state.regularFact = true; },
    has() { return state.regularFact; }
  },
  team: {
    who: "同伴坐下。他要修成队里认得出的样子。按住落剪，松手停住。",
    short: "他犹豫了一下：「队在找你。」路——他不说。",
    ok: "他更确信你会归队：「队在找你。」天堂怎么走，一个字没有。",
    long: "「剪过了。队在找你。」他站起来，仍不给坐标。",
    skip: "你没按。同伴在门口顿了顿：「队在找你。」然后走了。",
    done() { state.teamFact = true; },
    leave() { state.teamLeft = true; state.teamFact = true; },
    has() { return state.teamFact; }
  },
  wet: {
    who: "一个头发还在滴水的人坐下。他要剪成晴天出门的样子。按住落剪，松手停住。",
    short: "只修了一点。发梢还在滴：「我以为晴了。」",
    ok: "照他要求修完。他摸了摸仍湿的领口：「我以为晴了。」",
    long: "剪得太多。他还是湿的，重复那句：「我以为晴了。」",
    skip: "你没按。他在门口甩水：「我以为晴了。」头发还挂着潮。",
    done() { state.wetFact = true; },
    leave() { state.wetLeft = true; state.wetFact = true; },
    has() { return state.wetFact; }
  },
  yu: {
    who: "陈琛等你说停。这一剪只改长短。",
    short: "镜子里，头发几乎没短。没有新的记忆涌上来。",
    ok: "镜子里是他停手的长短。还是你。没有新的记忆。",
    long: "镜子里短了一截。镜面里的人仍想不起盔在哪。",
    skip: "",
    done() { state.yuCut = true; state.cuttingYu = false; },
    leave() {},
    has() { return state.yuCut; }
  }
};

function releaseSeated(kind) {
  const id = seatedGuest();
  if (!id) return "";
  const cut = CUTS[id];
  const already = cut.has();
  cut.leave();
  chairId = null;
  return kind === "skip" && !already ? cut.skip : "";
}


function paintCut() { notify(); }

function growCut(now) {
  if (!holding) return;
  cutValue = Math.min(100, ((now - cutStarted) / 1600) * 100);
  notify();
  cutRaf = requestAnimationFrame(growCut);
}

function startHold(e) {
  if (!activeCut() || holding) return;
  if (e && e.button !== undefined && e.button !== 0) return;
  if (e) e.preventDefault();
  holding = true;
  cutValue = 0;
  cutStarted = performance.now();
  notify();
  if (e && e.currentTarget && e.currentTarget.setPointerCapture && e.pointerId !== undefined) {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* greybox */ }
  }
  cutRaf = requestAnimationFrame(growCut);
}

function stopHold(commit) {
  if (!holding && commit !== true) {
    holding = false;
    return;
  }
  const was = holding;
  holding = false;
  cancelAnimationFrame(cutRaf);
  if (!was || commit === false) {
    cutValue = 0;
    notify();
    return;
  }
  const id = activeCut();
  if (!id) return;
  const zone = zoneOf(cutValue);
  const cut = CUTS[id];
  cut.done();
  // 剪完即离座：台词里写的就是「说完就走」「门在身后合上」，
  // 不留座也避免同一位客人被反复剪、反复给同一条信息。
  if (id !== "yu") cut.leave();
  let line = cut[zone];
  if (state.hideBand && zone === "ok" && id !== "yu") line += "陈琛多看了你一眼。";
  if (id === "team" && state.alphaDone) line += "顿了顿，他又说：找的是缺勤的 07，不是迷路的朋友。";
  if (id === "regular" && !state.heardRootWarn) {
    state.heardRootWarn = true;
    line += "临走补一句：积水太久的巷，别站着。";
  }
  cutValue = 0;
  setLog(line);
  render();
}

function setRain(next) {
  const prev = state.rain;
  if (next === prev) {
    say("雨没有再变。檐口的滴还是那个疏密。");
    return;
  }
  const skip = releaseSeated("skip");
  state.cuttingYu = false;
  stopHold(false);
  state.rain = next;
  let line = "";
  const inCitadel = state.at === "B1" || state.at === "B2" || state.at === "B3" || state.at === "B4";
  if (state.at === "C1" && next !== "storm") {
    state.at = "C0";
    line = "雨小了，口收回。你在门外。";
  } else if (state.at === "B4" && next !== "mid") {
    state.at = "B3";
    line = "那一阶没了。你还在七楼。";
  } else if (state.at === "E3") {
    line = "雨变了。那条没有门的走廊还开着。";
  } else if (state.at === "E2" && next !== "storm") {
    state.at = "E1";
    line = "到窗边的路收回了。你还在空街上。";
  } else if (state.at === "E1" && next === "storm") {
    line = "空街还在脚底。更里面的窗亮开一条缝。回去的围挡暂时合上。";
  } else if (state.at === "E1" && next !== "mid") {
    state.at = "E0";
    line = "空街像潮水退了。你还在围挡外面。" + (state.betaDone ? "窗台那本账里「未归」两个字，忽然很好懂。" : "");
  }
  if ((state.at === "B1" || state.at === "B2" || state.at === "B3") && inCitadel && !alleyOpen()) {
    state.at = "H";
    line = prev === "humid"
      ? "天真正晴了。残留的门洞没了。你回到店里。"
      : "雨停了，门洞收回。你还在城寨这边，被送回店里。本子上的字还在。";
  } else if (!line && next === "storm") {
    line = "水声压下来，盖过屋檐的滴。棚顶开始响成一片。";
  } else if (!line && next === "mid") {
    line = "雨声变密，砸在棚顶上一粒一粒。巷里的潮气往上返。";
  } else if (!line && next === "humid") {
    line = "潮气爬上玻璃和墙皮。天像晴了，店里那枚徽章还写回南。";
  } else if (!line) {
    line = "雨停了。檐口还在滴，一滴一滴慢下来。";
  }
  setLog(skip ? skip + line : line);
  render();
}

function waitAtWindow() {
  if (!state.readWindow || state.at !== "E2" || state.corridorOpen) return;
  state.corridorOpen = true;
  state.rain = "humid";
  setLog("潮气贴在玻璃上，像回南停在了这里。旁边多出一条没有门的走廊。");
  render();
}

function waitInsideMouth() {
  if (!state.readMold) return;
  state.scrapsSpawned = true;
  setLog("雨还在下。壁上的冲刷痕被重新泡开，浮出一块残片；口外地面还有一块。上面都没有地名。");
  render();
}

function actionsFor() {
  const at = state.at;
  const mid = state.rain === "mid";
  const list = [];
  const add = (label, fn, ghost) => list.push({ label, fn, ghost: !!ghost });

  if (at === "S") add("顺着霉花走", () => go("H"));
  if (at === "H") {
    add("出门", () => {
      const skip = releaseSeated("skip");
      state.cuttingYu = false;
      if (skip) setLog(skip);
      go("A1");
    });
    add("等到晴", () => setRain("clear"), state.rain === "clear");
    add("等到中雨", () => setRain("mid"), state.rain === "mid");
    add("等到暴雨", () => setRain("storm"), state.rain === "storm");
    add("等到回南天", () => setRain("humid"), state.rain === "humid");
    if (state.seenChen) add("问头盔在哪", () => say("陈琛摇头：「我又没跟你出任务。」店里没有第二顶盔。"), true);
    // 闲话：回店说话得有人味，没正事的时候也有一句可接（按局面筛过，轮换出）
    if (state.seenChen) add("跟陈琛闲话一句", () => say(chenIdleLine()), true);
    // 尾声短景：定了结局之后回店里再坐一次，只给一次
    if (state.ending && !state.epilogueRead) {
      add("再坐一会儿", () => {
        state.epilogueRead = true;
        say(epilogueLine());
      });
    }
    if (state.sawNumber && !state.knowId) add("把编号给陈琛看", () => {
      state.knowId = true;
      say("陈琛看了一眼湿布上抄下来的字：「霓虹浮游。07。」顿了顿：「盔呢？这个我还是不知道。」");
    });
    if (state.hasD1 && state.hasD2 && !state.knowHeaven) add("在手账里拼残片", () => {
      state.knowHeaven = true;
      say("两块残片的撕口对上，手账里写出三个字：早产天堂。这些街上走不到。盔还不在手上。陈琛不给路。");
    });
    else if ((state.hasD1 || state.hasD2) && !(state.hasD1 && state.hasD2)) add("试着拼残片", () => say("撕口还缺一块。单独看，哪都不像。"), true);
    if (state.sawHelmet && !state.heardTaboo) add("听门口的人", () => {
      state.heardTaboo = true;
      state.heardRootWarn = true;
      say("门口的椅子是空的。那个人站着，不坐下。「那种不靠雨的走法，不该被你想起来。」声音很平。又补一句：积水太久、气根自己摆起来，就绕开。坐标——一个字没有。");
    });
    if (!seatedGuest() && state.regularFact && !state.yuCut) {
      add("让陈琛给你修一下", () => { state.cuttingYu = true; setLog("他把剪刀拿稳，等你说停。镜子里只有现在的你。"); render(); });
    }
    if (!seatedGuest() && state.regularFact && !state.yuRefused) add("把迷茫剪掉", () => {
      state.yuRefused = true;
      state.cuttingYu = false;
      say("陈琛把剪刀放回布里：「这种活我接过。不接你的。」精度条没有出现。");
    }, true);
    if (state.knowHeaven && !state.knowHumid) add("问他们什么时候谈盔", () => say("陈琛不抬头：「巷尾那圈湿印，你还没走过。」不解释是什么雨。"), true);
    if (state.knowHeaven && state.knowHumid && !state.knowChoice && !seatedGuest()) add("听三方把话说完", () => {
      state.knowChoice = true;
      let line = "店里没有剪刀上场。浮游要你戴上，变成被写好的完整。避雨人要你忘掉。陈琛靠在柜台边，不替你选。";
      if (state.alphaDone) line += "浮游那一侧听起来更像编制在回收缺勤的 07。";
      if (state.etaDone) line += "避雨人临走摸了摸门廊那只绿盒，仍不给路。";
      if (state.iotaDone) line += "陈琛揉着手腕说：迷茫不能剪，也不该由他写。";
      say(line);
    });
    if (state.seenChen) add("看窗台潮簿", () => {
      state.sawBook = true;
      if (state.knowHumid || state.wetFact) {
        state.betaDone = true;
        say("两行终于拆开。一行是雨停了人还留在潮底；一行是误写成晴的回南。有人以为天晴了就走，名字落在「未归」。");
      } else {
        say("一本潮软的簿，夹在窗缝里。字两行叠在一起，像晴天和回南抢同一格。现在读不懂。");
      }
    });
    if (state.seenChen) add("看柜台湿信封", () => {
      state.sawLetter = true;
      if (state.knowHeaven || state.alphaDone) {
        state.zetaDone = true;
        say("字慢慢聚拢。一封寄给测绘点的短嘱，口气像有人托邮差代送记忆。潮底有人专捡这种旧事。");
      } else {
        say("柜台多出一封永远不干的信。门牌模糊。墨晕成潮，现在拆不开。");
      }
    });
    if (state.sawTicket && !state.deltaDone && !state.deltaRefused) {
      add("把粮票给陈琛看", () => {
        state.deltaDone = true;
        say("陈琛看了一眼，声不高：「楼上有人代收快递。」他不介绍是谁。你只知道潮底还有住得更深的人。");
      });
      add("拒收粮票", () => {
        state.deltaRefused = true;
        say("你把粮票塞回口袋。门缝那句「酱油还你」忽然没味道了。");
      }, true);
    }
    if (state.regularLeft && !state.iotaDone) add("问陈琛的手腕", () => {
      state.iotaDone = true;
      say("他揉了揉腕骨，承认一半：关节会痛的那种人。迷茫不能剪；剪了，也不该由他来写。他不是站在雨外的人。");
    });
    if (state.knowId && !state.alphaDone) add("听陈琛提箱子", () => {
      say("陈琛：「你们队在城寨口还有箱子。」怎么开，他不说。");
    }, true);
    if (state.knowHeaven && !state.gammaDone) add("听陈琛提封条", () => {
      say("陈琛：「围挡里有同款褪色封条。」路——仍然没有。");
    }, true);
    if ((state.wetFact || state.knowHumid) && !state.betaDone) add("听陈琛提滞留账", () => {
      say("陈琛点点窗台：「店里有本账，专记这种以为晴了的人。」那本潮簿还夹着。");
    }, true);
  }
  if (at === "A1") {
    add("回店", () => go("H"));
    add("看霉花", () => { state.readFork = true; say("同一串霉只连着巷子。旁边像门的口、那排围挡上，都没有这纹路。像霉也挑路。"); });
    add("看挂钩绿盒", () => {
      state.sawGreenBox = true;
      if (state.heardTaboo) {
        state.etaDone = true;
        say("绿色木质空双喜烟盒。忌讳对上了——避雨人用这个相认。他们管的是平衡，不是给你指路。");
      } else {
        say("门廊挂钩上挂着一只绿色木质空双喜烟盒。怪挂件。对不上哪一类人。");
      }
    });
    add("进巷", () => go("A2"));
    add("绕到深层口", () => go("C0"));
    add("去工地围挡", () => go("E0"));
  }
  if (at === "A2") {
    add("回门廊", () => go("A1"));
    add("看巷顶垂须", () => {
      state.sawRoots = true;
      if (state.rain === "storm" && state.heardRootWarn) {
        state.epsilonDone = true;
        say("气根在暴雨里微微摆，像在找热。你想起别站积水。握手楼之间的阴凉，不是给人歇脚的。");
      } else if (state.rain === "storm") {
        say("暴雨里气根微摆，像要找热。积水没过靴面。你还不知道该不该站在这里。");
      } else {
        say("巷顶垂着气根，只见阴凉。雨不大的时候，它们几乎不动。");
      }
    });
    add("看前面", () => say("来路还在脚后。巷子不长，前面就到头。墙上没有地名。"));
    add("走到巷尾", () => go("A3"));
  }
  if (at === "A3") {
    add("退回巷中", () => go("A2"));
    add("看墙根", () => {
      state.readAlley = true;
      state.sawWall = true;
      syncRead();
      if (state.rain === "humid") {
        say("墙根还潮。现在这圈是湿印，能踩过去。霉停在砖缝上，像曾经穿到对面。");
      } else if (state.rain === "mid") {
        say("门洞边上，墙根那截潮被雨重新写湿。没有字。潮气还在。");
      } else {
        say("指腹按上去，凉的。霉的纹路像从墙对面折回来，停在你脚边。没有字。没有箭头。只有潮气在说：这里跟雨有过关系。");
      }
    });
    if (state.rain === "mid") add("走进门洞", () => go("B1"));
    else if (state.rain === "humid") add("走进湿门印", () => go("B1"));
  }
  if (at === "C0") {
    add("回店门廊", () => go("A1"));
    add("进城寨口", () => go("B1"));
    add("看门边", () => {
      state.readGate = true;
      state.sawDoor = true;
      say(state.rain === "storm"
        ? "门开着。水渍比巷尾那道更重，渍痕还在往门缝里咬。"
        : "像有一道门，合着。水渍比巷尾那道更重，渍痕往门缝里咬。没有字。");
    });
    if (state.rain === "storm") add("进门", () => go("C1"));
    if (state.scrapsSpawned && !state.hasD2) add("捡起地面残片", () => { state.hasD2 = true; say("一块残片。没有地名。撕口还缺另一半。得带回店里的手账，才像能拼的东西。"); });
  }
  if (at === "C1") {
    add("出门", () => go("C0"));
    add("看空盔印", () => {
      state.sawHelmet = true;
      state.knowStorm = true;
      say("地上一个空的盔印。印缘清楚——有人说过，盔能让人不靠雨走。印是空的。盔不在这里。");
    });
    add("看空盔印旁的涂鸦", () => {
      state.knowCut = true;
      say("印旁涂着半页队规：出勤要对上编号和切口。没有写箱子在哪，也没有写请打开。");
    });
    if (!state.readMold) add("看壁上的霉", () => {
      state.readMold = true;
      say("壁上的霉和冲刷痕叠在一起，像被同一场大雨泡过，又缺了一次——缺人站在口里的那一次。不是说明书。只是印记还没完。");
    });
    if (state.readMold && !state.scrapsSpawned) add("再在口里等一场雨", () => waitInsideMouth());
    if (state.scrapsSpawned && !state.hasD1) add("捡起墙上残片", () => { state.hasD1 = true; say("墙上浮着的残片。没有地名。撕口还缺另一半。得带回店里的手账。"); });
  }
  if (at === "B1") {
    add("上楼梯", () => go("B2"));
    add("去深层口", () => go("C0"));
    add("看出勤箱", () => {
      state.sawBox = true;
      if (state.alphaDone) {
        say("箱盖还敞着。出勤页和那张上交附注，你已经读过。");
      } else if (state.sawNumber && state.knowCut) {
        say("金属箱。07 对得进槽，队规那句切口也齐了。锈在等你拧开，不是等下一场雨。");
      } else if (state.sawNumber) {
        say("钉死的金属箱。槽位像湿布上的 07，还缺一句切口。");
      } else {
        say("湿布旁钉死一只金属箱。锁不是淋湿就会松的那种。槽位空着。像队里的东西。");
      }
    });
    if (state.sawBox && state.sawNumber && state.knowCut && !state.alphaDone) add("打开出勤箱", () => {
      state.alphaDone = true;
      say("箱里没有盔。一叠被雨泡过的出勤页：编号、到岗、缺勤。夹页写着坐标任务是上交的，不是私活。当晚 07 那一格空着。");
    });
    add("看墙上的湿布", () => {
      if (state.rain === "storm") {
        state.sawNumber = true;
        say("暴雨把字泡开了：07。布钉死在墙上，拿不下来。07 是谁，布上没写。");
      } else {
        state.readCloth = true;
        say("一块钉死的湿布。字泡糊了，再湿一点或许能认。布边没有路标，也没有绕路说明。");
      }
    });
    if (state.passedMid || state.passedHumid) add("看门框", () => {
      state.readFrame = true;
      syncRead();
      say(state.rain === "humid"
        ? "门框内侧潮着。天已经像晴了，靴底却还湿。店里那枚徽章若在，大概比天可信。"
        : "门框内侧有一截潮痕，像谁靠过。没有字。");
    });
    if (alleyOpen()) add("返回巷尾", () => go("A3"));
    else add("看回去的路", () => say("来时的门洞不在了。深层口那边还能绕回店。"), true);
  }
  if (at === "B2") {
    add("下到城寨口", () => go("B1"));
    add("看门缝粮票", () => {
      state.sawTicket = true;
      if (state.deltaDone) say("门缝空了。回礼已经了结，里面仍没有声音。");
      else if (state.deltaRefused) say("粮票还在你口袋。门缝那句「酱油还你」没味道了。");
      else say("某扇关着的门缝夹着旧粮票，字条写：酱油还你。敲不开。");
    });
    if (state.sawTicket && !state.deltaDone && !state.deltaRefused) add("把酱油放回门缝", () => {
      state.deltaDone = true;
      say("你按条把一瓶酱油抵进门缝。里面没有声音。潮底还有人住得更深——只是不肯露面。");
    });
    add("看这几层", () => say("一楼到七楼是普通的楼，门关着。霉淡了，还在往上指。这几层没有多出来的东西。"));
    add("上到七楼转角", () => go("B3"));
  }
  if (at === "B3") {
    add("下楼", () => go("B2"));
    add("看踏步", () => {
      if (mid) {
        state.sawMold = true;
        say(state.fragment
          ? "霉还指着多出来的那一阶。你已经上去过。"
          : "霉指向多出来的一阶。阶边潮着，像巷尾那截墙根。没有字。只觉得上面可能有当晚的自己。");
      } else {
        state.readStepDry = true;
        say("楼梯到这里就停了。踏步边留着潮和旧霉，像巷尾墙根那样——跟雨有过关系，却不告诉你等哪一场。");
      }
    });
    if (mid && state.sawMold) add("踏上那一阶", () => go("B4"));
  }
  if (at === "B4") {
    add("退回七楼", () => go("B3"));
  }
  if (at === "E0") {
    add("回店门廊", () => go("A1"));
    add("看海报", () => {
      state.sawPoster = true;
      say(state.knowHeaven
        ? "海报字褪成影子。你认得围挡圈住的是早产天堂的边。谁贴的，看不出来。"
        : "海报字褪成影子。看不出这是哪里，也看不出是谁贴的。");
    });
    add("看封条柜", () => {
      state.sawCabinet = true;
      if (state.gammaDone) {
        say("柜门还敞着。空白成绩栏和半页验收表在原处。人在表上是空行。");
      } else if (state.knowHeaven || state.alphaDone) {
        say("褪色封条与海报同一套油墨。柜缝夹着测绘尺的角。你认得出：未开幕的城的边角。可以撕。");
      } else {
        say("缺口内侧一只贴着褪色封条的工具柜。不知是谁封的。撬不动。");
      }
    });
    if (state.sawCabinet && (state.knowHeaven || state.alphaDone) && !state.gammaDone) add("撕开封条", () => {
      state.gammaDone = true;
      say("柜里没有人名。一张空白成绩栏，半页「坐标验收」口吻的表。潮底测绘被写成了可勾选的工程。");
    });
    add("看缺口", () => {
      state.readGap = true;
      say(state.rain === "mid"
        ? "缺口开着，潮气灌出来。里面像还有街。旁边没有说明。"
        : "缺口现在合着，缝里仍潮。旁边没有说明。");
    });
    if (state.rain === "mid") add("走进空街", () => go("E1"));
  }
  if (at === "E1") {
    if (state.rain === "mid") add("退回围挡", () => go("E0"));
    else add("看回去的围挡", () => say("回去的缺口不在了。空街还托着你的脚。"), true);
    add("仰望塔吊", () => {
      state.thetaDone = true;
      say(state.gammaDone
        ? "潮底一座塔吊：吊臂生着蕨，驾驶舱像人刚走。建设的记忆正被树一点点收回。你想起柜里那张空表——未来在这里已经荒了。"
        : "潮底一座塔吊：吊臂生着蕨，驾驶舱像人刚走。早产天堂的「未来」，在潮底已经荒掉。");
    });
    add("看街尽头", () => {
      state.readStreet = true;
      say(state.rain === "storm"
        ? "幕墙后面的窗开着一条缝，水声就在玻璃那侧。空街还托着你——离开这儿，街会先没。"
        : "街在玻璃幕墙前断了。更里面像有窗，够不着。这条街是雨给的；要换雨，只能站在这儿换。回店里等，脚底下先空。");
    });
    if (state.rain === "storm") add("走到窗边", () => go("E2"));
    add("等到晴", () => setRain("clear"), state.rain === "clear");
    add("等到中雨", () => setRain("mid"), state.rain === "mid");
    add("等到暴雨", () => setRain("storm"), state.rain === "storm");
    add("等到回南天", () => setRain("humid"), state.rain === "humid");
  }
  if (at === "E2") {
    if (state.rain === "storm") add("退回空街", () => go("E1"));
    else add("看回空街", () => say("来时的空街收回了，幕墙还贴着脸。"), true);
    if (!state.readWindow) add("看窗上的霉", () => {
      state.readWindow = true;
      say("玻璃上的霉和潮叠在一起，像差一场停在这里不散的雨。上一次你学会等，是在店里那把椅子上。");
    });
    if (state.readWindow && !state.corridorOpen) add("再在窗边等一场雨", () => waitAtWindow());
    if (state.corridorOpen) add("走进走廊", () => go("E3"));
    add("等到晴", () => setRain("clear"), state.rain === "clear");
    add("等到中雨", () => setRain("mid"), state.rain === "mid");
    add("等到暴雨", () => setRain("storm"), state.rain === "storm");
    add("等到回南天", () => setRain("humid"), state.rain === "humid");
  }
  if (at === "E3") {
    add("退回窗边", () => go("E2"));
    if (!state.ending) {
      add("戴上", () => {
        state.ending = "wear";
        state.helmetOnCounter = false;
        state.endingLine = endingLine(
          "wear",
          "盔扣上的一刹，当晚的路线回来了：去把坐标标完。你听见自己的口气变了——像队里的人在说话。"
        );
        say(state.endingLine);
      });
      // 不戴要知道自己的名字：把盔放下是一个「自己」做的选择。
      // 不知道自己是谁的人接不住这个动作——那不是拒绝，只是没接住。
      // 戴上永远可得：不认识自己就把自己交出去，正是这条线要写的东西。
      if (state.name) {
        add("不戴", () => {
          state.ending = "leave";
          state.helmetOnCounter = true;
          state.endingLine = endingLine(
            "leave",
            "你把盔留在柜台上。有些事仍然想不起来。缺口还在，完整的自己也还在别处。"
          );
          setLog(state.endingLine);
          state.at = "H";
          state.visited.H = true;
          render();
        });
      }
    }
  }
  return list;
}

function placeCopy() {
  const mid = state.rain === "mid";
  const copy = {
    S: ["湿巷起点", "潮底的巷。雨衣还在滴。没有盔。墙上的霉发亮，指向一间还亮着灯的店。"],
    H: ["理发店内", (state.seenChen
      ? "灯是亮的。店里干。手账在柜台上。引你来的霉停在门外，没有伸进来。窗台夹着潮簿。柜台有湿信封。"
        + (state.sawHelmet && !state.heardTaboo ? "门口的椅子是空的，那个人站着。" : "")
      : "灯是亮的。一个光头理发师看着你身上的雨衣和护肘。")
      + (state.helmetOnCounter ? "柜台上放着那顶盔。" : "")
      + (state.ending === "wear" ? "你说话的口气变了。陈琛看着你，没接话。" : "")],
    A1: ["店门廊", "店门口。地上有一串霉，顺着门槛往外爬。挂钩上有一只绿色空盒。旁边有个像门的口，还有一排围挡。"],
    A2: ["巷中", "来路还在脚后。前面是巷尾。巷顶垂着气根。"],
    A3: ["巷尾", state.rain === "mid"
      ? "墙的位置开了。门洞对面是握手楼挤在一起的城寨口。墙根潮着。"
      : state.rain === "humid"
        ? "天看着晴了，墙却在出汗。墙上有一圈湿印，印子里是空的，能走。墙根还潮。"
        : "巷尾是墙。霉停在砖上。墙根有一行潮痕，晴天里还没干透。"],
    C0: ["深层口外", (state.rain === "storm" ? "门开着。水渍很重。" : "像有一道门，合着。水渍比巷尾更重。")
      + (state.scrapsSpawned && !state.hasD2 ? "地面有一块残片。" : "")],
    C1: ["深层口内", state.scrapsSpawned && !state.hasD1
      ? "空盔印还在。墙上浮着一块残片。"
      : "地上一个空盔印。壁上有霉和冲刷痕。"],
    B1: ["城寨口", "握手楼贴在一起。霉转向楼梯。墙上有一块拿不下来的湿布。湿布旁钉着金属箱。回去的门洞" + (alleyOpen() ? "还在。" : "不在了。")
      + ((state.passedMid || state.passedHumid) ? "门框内侧摸上去有点潮。" : "")
      + (state.rain === "humid" ? "往上的楼梯，像少了一截。" : "")],
    B2: ["楼梯 1–7", "一到七楼。霉淡了，还在往上。有扇门缝夹着东西。"],
    B3: ["七楼转角", mid
      ? "踏步边缘有霉，像多指了一阶。"
      : "楼梯到这里就停了。踏步边留着潮和旧霉。"],
    B4: ["八楼潮底踏", state.fragment
      ? "多出来的一层。名字和当晚的奔跑已经回到你身上。盔不在这里。"
      : "多出来的一层。地上有一段被雨淋开的记忆。"],
    E0: ["工地围挡", "围挡圈着一块工地。褪色海报贴在上面。缺口内侧有封条柜。"
      + (state.rain === "mid" ? "缺口开着，潮气往外冒。" : "缺口合着，缝里仍潮。")],
    E1: ["空街", "玻璃幕墙立着，街上没有人。潮底有一座塔吊。"
      + (state.rain === "storm" ? "更里面的窗开了。" : "街在幕墙前断了。")],
    E2: ["窗边", state.corridorOpen
      ? "窗还在。旁边那条没有门的走廊开着。"
      : "一排窗。玻璃上有霉和未干的潮。"],
    E3: ["无门走廊", state.ending === "wear"
      ? "电梯仍停在 0。盔已经扣在头上。口气变了。"
      : state.ending === "leave"
        ? "电梯停在 0。盔不在了。"
        : "电梯停在 0。窗外的天还没到。尽头放着一顶盔。"]
  };
  return copy[state.at];
}



function journalSnapshot() {
  const todos = [];
  const known = [];
  // 开场：玩家当完全不懂这城；见陈琛后先记下他说过的那场雨，再用一念待办带进门
  if (state.seenChen) {
    known.push("陈琛说，我进来那会儿巷尾有过门洞。抬头看，天确实晴了。他说店里的徽章比天准——我先记下他。");
  }
  if (!state.seenChen && state.at === "S") {
    todos.push("霉只往那间亮灯的店里去");
  }
  if (state.seenChen && !state.ending && !state.knowRain) {
    if (state.rain !== "mid") todos.push("巷尾那道门洞是怎么回事");
    else todos.push("这场雨还没停。巷尾那道口，这会儿该能走了");
  } else if (state.seenChen && !state.ending) {
    if (state.readGap && !state.enteredE1) todos.push("围挡缺口潮着，里面像还有街");
    else if (state.sawPoster && state.knowHeaven) todos.push("围挡里面，是不是早产天堂的边");
    else if (state.knowHeaven) todos.push("早产天堂在哪一带");
    else todos.push("盔去哪了");
  }
  if (state.readFork) known.push("霉只连着巷。旁边那些口上没有。");
  if (state.knowRain) known.push("中雨那会儿巷尾真的通了。雨一停，我又站回墙前面。陈琛没骗我。");
  if (state.readStepDry && !state.knowFold && !state.sawMold) todos.push("七楼踏步边那截潮，跟雨有什么关系");
  if (state.sawMold && !state.knowFold) todos.push("多出来的那一阶，要不要上去");
  if (state.knowFold) known.push("我叫林玉真。当晚从八楼跑过。盔不在那层。人还往更深的地方去过。");
  if (state.readCloth && !state.sawNumber) todos.push("湿布上的字，再湿一点或许能认");
  if (state.sawNumber && !state.knowId) todos.push("07 是谁");
  if (state.knowId) known.push("陈琛说，07 是霓虹浮游。盔他还是不知道。");
  if (state.readGate && !state.enteredC1) todos.push("这道更重的口，什么时候才开");
  if (state.knowStorm) known.push("口里有个空盔印。有人靠盔不靠雨走。印是空的，盔不在那里。");
  if (state.readMold && !state.scrapsSpawned) todos.push("这些冲刷痕，还差人在口里的一次");
  if ((state.hasD1 || state.hasD2) && !(state.hasD1 && state.hasD2)) todos.push("残片还缺一块");
  if (state.hasD1 && state.hasD2 && !state.knowHeaven) todos.push("残片要放在一起看");
  if (state.knowHeaven) known.push("当晚要去的地方叫早产天堂。这些街上还没有它。");
  if (state.heardTaboo) known.push("门口那人要我忘掉不靠雨的走法。他不给路。");
  if (state.regularFact) known.push("常客说过：雨一变，路就变。");
  if (state.teamFact) known.push("队在找我。天堂怎么走，他们不说。" + (state.alphaDone ? "找的是缺勤的 07。" : ""));
  if (state.knowHeaven && !state.knowHumid && !state.passedHumid) todos.push("巷尾那圈湿印，还没走过");
  if (state.knowHumid) known.push("天已经像晴了，巷尾那圈湿印却还能走。以后看店里徽章，别抬头看天。");
  if (state.wetFact) known.push("有人剪完头发还在滴水，只重复：我以为晴了。");
  if (state.knowChoice) known.push("戴上会变成被写好的完整。忘掉是另一边要的。陈琛不替我选。");
  if (state.sawPoster && state.knowHeaven) known.push("围挡里面是早产天堂的边。海报上叫不出是谁贴的。");
  if (state.readStreet && !state.enteredE2) todos.push("空街在幕墙断了，更里面什么时候开");
  if (state.readWindow && !state.corridorOpen) todos.push("窗上的霉，还差一场停在这里的雨");
  if (state.corridorOpen) known.push("窗边开过一条没有门的走廊，还留着。");
  if (state.ending === "wear") known.push("我戴上了。当晚是去标坐标。口气变成队里的人。" + ringNote("wear"));
  if (state.ending === "leave") known.push("盔留在店柜台上。有些事仍然想不起来。" + ringNote("leave"));
  if (state.alphaDone) known.push("箱子里的表写着，坐标是要上交的活。07 那一格空着——像在等一个没回来的人。");
  if (state.betaDone) known.push("潮底会留下人。有人以为天晴了就走，名字落在未归。");
  if (state.gammaDone) known.push("柜里是空白成绩栏和验收表。人在表上是空行。");
  if (state.deltaDone) known.push("门缝用粮票回礼。潮底还有住得更深、不肯露面的人。");
  if (state.epsilonDone) known.push("气根会找热。积水太久的巷，不该站着。");
  if (state.zetaDone) known.push("湿信是寄给测绘点的短嘱。有人在潮底捡失落的旧事。");
  if (state.etaDone) known.push("门廊那只绿双喜盒，是避雨人的相认符。他们不指路。");
  if (state.thetaDone) known.push("空街的塔吊吊臂生蕨。未来在潮底已经荒了。");
  if (state.iotaDone) known.push("陈琛的手腕会痛。迷茫他不剪，也不替人写。");
  // 玩家面不区分主／支：未完线索一律进「还在想」，不做旁环分区
  const more = [];
  if (state.sawBox && !state.alphaDone) more.push("城寨口那只箱子，还缺编号或切口");
  if (state.sawBook && !state.betaDone) more.push("窗台潮簿的字还叠着");
  if (state.sawCabinet && !state.gammaDone) more.push("封条柜——油墨眼熟，还认不真");
  if (state.sawTicket && !state.deltaDone && !state.deltaRefused) more.push("门缝里那张粮票，是谁留的");
  if (state.sawRoots && !state.epsilonDone) more.push("巷顶那些气根，水声大的时候在找什么");
  if (state.sawLetter && !state.zetaDone) more.push("湿信封的字还晕着");
  if (state.sawGreenBox && !state.etaDone) more.push("绿空盒还对不上人");
  if (state.sawBox && state.sawNumber && !state.knowCut) more.push("空盔印旁好像还有半页队规");
  if (state.sawBox && state.sawNumber && state.knowCut && !state.alphaDone) more.push("城寨口那只箱子，现在能开了吗");
  if ((state.wetFact || state.knowHumid) && state.sawBook && !state.betaDone) more.push("窗台那本账，该再读一次");
  if (state.knowHeaven && state.sawCabinet && !state.gammaDone) more.push("围挡里的封条，油墨对得上了");
  more.forEach((t) => {
    if (todos.length < 4) todos.push(t);
  });

  return {
    todos: todos.length ? todos : [],
    known: known.length ? known : [],
    notes: [], // 兼容旧字段；界面不再展示「旁环」分区
    banners: {
      act1: !!(state.knowRain && state.knowFold && state.seenChen),
      heaven: !!state.knowHeaven,
      choice: !!(state.knowChoice && state.teamFact && state.knowHumid),
      ending: !!state.ending,
    },
    cutId: activeCut(),
  };
}

function notify() {
  if (typeof onChange === "function") onChange();
}

function render() { notify(); }

function getNeighbors() {
  return NODES.filter((n) => canGo(state.at, n.id)).map((n) => ({
    id: n.id,
    name: n.name,
    zone: n.zone,
  }));
}

function getEdgeFlags() {
  const mid = state.rain === "mid";
  return {
    alley: state.rain === "mid" ? "open" : state.rain === "humid" ? "wet" : "shut",
    step: mid ? "open" : "shut",
    gate: state.rain === "storm" ? "open" : "shut",
    street: state.rain === "mid" ? "open" : "shut",
    window: state.rain === "storm" ? "open" : "shut",
    hall: state.corridorOpen ? "open" : "shut",
    rings: ringCount(),
  };
}


  return {
    state,
    NODES,
    CUTS,
    go,
    setRain,
    say,
    canGo,
    ringCount,
    actionsFor,
    placeCopy,
    journalSnapshot,
    endingSnapshot,
    getNeighbors,
    getEdgeFlags,
    rainName,
    alleyOpen,
    activeCut,
    seatedGuest,
    startHold,
    stopHold,
    waitInsideMouth,
    waitAtWindow,
    learnFold,
    syncRead,
    render: notify,
    cutProgress: () => cutValue,
    isHolding: () => holding,
    setHideBand(v) { state.hideBand = !!v; notify(); },
    subscribe(fn) {
      onChange = typeof fn === "function" ? fn : () => {};
      onChange();
    },
  };
}
