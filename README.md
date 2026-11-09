# 借雨（雨底之东 · 试玩）

**在线试玩：https://hukaidi1224-cloud.github.io/jieyu/**（本仓库 `main` 部署，无需安装）

浏览器打开就能玩的叙事探秘 demo：**这座城的关卡语言只有一条——雨的大小改变街区的连通性。** 店里那把椅子可以把雨等来（晴／中雨／暴雨／回南天），雨一变，能走的路就跟着换；另有一些路不看天，看你已经知道什么。

**0.9.25-audio**：标题页＋说明页（开始前挡住全部交互）；探索 ↔ 全屏详情；场景换皮（每节点独立调色）；WebAudio 实时合成音效（雨声分嘶／轰鸣／雨点三层，随雨大小变，无外部音频文件；三档有雨的天气实测标定在回南天 -34.6 → 暴雨 -21.9 dBFS，线上中雨实测 -29.6；**晴＝雨停，这一档不出雨声**）；点地面、点热区、点选项都有一记敲击反馈音（起振噪声＋240Hz 撞击体）；26 个观察点全部挂图；剪发收尾（按住落剪、松手停住，剪成什么样决定客人告诉你什么）；名字是钥匙（没想起名字只给「戴上」）；结局收口卡＋可漏差落到三处；陈琛闲话池。

试玩版情况：单周目、无存档，关掉页面就从头开始；结局两个，最快 11 步能走到结尾。手机触屏尚未在真机上验证，建议先用电脑玩。

想照着操作走一遍，看 [通关指南.md](通关指南.md)——按画面上能点到的圆点逐步写，从开头到盔前的抉择，含九件事的前置与卡住排查（剧透提示在文首）。

## 两态

| 态 | 做什么 |
|---|---|
| **探索** | 俯视场景内移动；点门换景；点兴趣点／NPC／等雨椅子 |
| **详情** | 全屏插图／正文／选项；**返回移动** 回探索（`Esc` 同） |

进店首次会进详情读陈琛开场。立绘与观察插图都有真图；没挂图的观察只出正文，左栏整条收起。

探索换皮入口：`.shell[data-scene-skin]`、`[data-restyle="scene-stage"]`、CSS 变量 `--scene-*`。

## 命令

```bash
npm ci
npm test                     # 7 文件 32 测（jsdom 里跑真实点击流）
npm run dev                  # http://localhost:5173/jieyu/
npm run build && npm run preview
```

热区核对页（开发用，不进构建）：`/jieyu/tools/review.html?scene=H`。

## 部署

站点地址＝**https://hukaidi1224-cloud.github.io/jieyu/**，路径由 `vite.config.ts` 的 `base` 决定，当前是 `/jieyu/`；**改名仓库要同步改这一行**，否则线上整站资源 404。

图片路径不以字面量直接写进 DOM：`src/art/manifest.ts` 的 `ASSETS` 保留以 `/` 开头的路径作为唯一真相源，`artUrl()` 在运行时把站点根（`import.meta.env.BASE_URL`）拼上去。单测下 `BASE_URL` 是 `/`，所以测试断言仍是 `/art/...`。

发布链＝`.github/workflows/deploy.yml`：push 到 `main` → `npm ci` → `npm test` → `npm run build` → 上传 `dist` → 部署到 Pages。测试不通过就不部署。本地 `npm run build && npm run preview` 走的也是同一个 base，本机能开线上就能开。

## 美术

| 路径 | 说明 |
|---|---|
| `public/art/scenes/` | 探索底图（15 节点，比例混用 4:3／1:1／3:4；尺寸登记在清单） |
| `public/art/portraits/` | 详情立绘 |
| `public/art/observe/` | 观察插图（26 个观察点全部挂图，尺寸登记在清单） |
| `src/art/scenes.ts` | 热区 |
| `src/art/manifest.ts` | 清单 |

补一张观察插图的顺序：文件放 `public/art/observe/` → 在 `ASSETS` 登记 `kind: "observe"` 与真实 `w/h` → 在 `OBSERVE_ART` 加一行标签映射。出图入口＝Qoder 自带 ImageGen（会话模型需为非 BYOK 的订阅模型），场景底图与插图的风格口径＝「脏平 v7」，禁用样张家族见 `manifest.ts` 的 `BANNED_PATTERNS`。
