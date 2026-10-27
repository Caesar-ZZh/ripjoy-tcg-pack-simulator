# 开包有喜 RipJoy · 宝可梦 TCG 开包模拟器

**真实卡池 · 真实稀有度 · 真实参考价 · 社区校准概率 · 分稀有度全屏演出**

选一弹真实卡包，撕开它，逐张翻卡：普通卡快过，AR 彩虹粒子雨，SAR / 金卡全屏接管——金粉爆发、冲击波、合成音效、手机震动，一样不少。

## 在线体验

GitHub Pages（部署后）：https://caesar-zzh.github.io/ripjoy-tcg-pack-simulator/
本地运行：`npm run dev` 后打开 http://localhost:4173 （零构建、零依赖，静态站）

## 功能

- **4 个真实弹系**：Pokémon 151（EN）、Surging Sparks、Destined Rivals、ポケモンカード151（日版，7 张包）——共 913 张真实卡，含画师与 Cardmarket 参考价
- **卡槽概率模型**：普通/非普通/反闪/稀有四类卡槽，权重全公示（见战绩页与 `docs/PRD.md`）；新用户首包保底 AR 以上
- **分级演出（L0–L4）**：卡背漏光预告 → 3D 翻卡全息扫光 → RR 紫色星尘 → AR/UR 彩虹粒子雨 → SAR/金卡全屏金粉双爆 + 冲击波 + 闪光 + 震动
- **自研 Canvas 粒子引擎**（零依赖）+ **WebAudio 合成音效**（无音频素材）+ 3D 倾斜全息卡面查看
- **收藏册与战绩**：localStorage 持久化，图鉴完成度、最佳藏品、开包历史、十连开总结算

## 数据与概率口径

- 卡池/稀有度/卡图：[TCGdex](https://tcgdex.net) 开放数据库（构建期由 `scripts/fetch-set.mjs` 抓取为静态 JSON，新增弹系跑一次脚本即可）
- 参考价：Cardmarket 趋势价（€），随 TCGdex 数据更新
- 概率：官方未公布完整出率；模型参照 TCGplayer 大样本开箱统计与社区模拟器校准值，SAR 单包综合约 3–5%（蒙特卡洛实测），为「可玩性校准」而非官方出率，详见 PRD 第 5 节

## 项目结构

```
index.html            入口
docs/PRD.md           完整产品文档（定位/概率/演出脚本/验收标准）
docs/RESEARCH.md      开源项目与数据源调研
src/engine.js         概率引擎（卡槽模型）
src/particles.js      Canvas 粒子引擎
src/fx.js             音效合成 / 震动 / 3D 倾斜
src/app.js            状态机与全部界面逻辑
src/styles.css        视觉系统（手机优先）
data/*.json           真实卡池（脚本生成）
scripts/fetch-set.mjs 数据更新脚本
```

非官方粉丝作品，与 Nintendo / Creatures Inc. / GAME FREAK inc. / The Pokémon Company 无关；不售卖、不涉及真实货币抽卡。理性看待实体卡开包：期望值为负，收藏请量力。
