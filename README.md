# 开包有喜 RipJoy · 宝可梦 TCG 开包模拟器

**真实卡池 · 真实稀有度 · 真实参考价 · 社区校准概率 · 分稀有度全屏演出**

选一弹真实卡包，撕开它，逐张翻卡：普通卡快过，AR 彩虹粒子雨，SAR / 金卡全屏接管——金粉爆发、冲击波、合成音效、手机震动，一样不少。

## 案例复盘

这个项目为什么这样做（问题 → 决策 → 取舍 → 结果数字）：见 [docs/CASE-STUDY.md](docs/CASE-STUDY.md)；产品文档 [docs/PRD.md](docs/PRD.md)，v2 剖析与规划 [docs/PRD-ANALYSIS-v2.md](docs/PRD-ANALYSIS-v2.md)。

## 在线体验

GitHub Pages（部署后）：https://caesar-zzh.github.io/ripjoy-tcg-pack-simulator/
本地运行：`npm run dev` 后打开 http://localhost:4173 （零构建、零依赖，静态站）

**完全离线版**：`dist/ripjoy-offline.html`（约 65MB）——在单文件版基础上，再把英文核心 4 弹的全部卡图以 webp data URI 内嵌（简中 5 弹卡图本就内嵌在卡池数据里），在任何拦截外部图片的应用内预览器/离线环境打开都能显示卡图。构建方式：`python3 scripts/fetch-images.py && node scripts/build-offline.mjs`（图片中间产物 data/images-embedded.json 可由脚本重新生成，未入库）。

## 功能

- **28 个真实弹系**（2026-10-27 二次扩充）：简中 5 弹（太晶盛聚／星彩晶璃／璀璨诡幻／利刃猛醒／收集啦151，真实简中卡面全部内嵌）、英文 19 弹（151、Prismatic Evolutions、Surging Sparks、Journey Together、Destined Rivals、Temporal Forces、MEGA 两弹、Black Bolt、White Flare、Phantasmal Flames、Ascended Heroes、Paldean Fates、Shrouded Fable、Twilight Masquerade、Stellar Crown、Paradox Rift、SV 前三弹）、日版 2 弹（151 为 7 张包、热风竞技场为 5 张包）、繁中 2 弹（5 张包）——共 5,700+ 张真实卡，含画师与 Cardmarket 参考价（中文弹暂无参考价）。暂未上架：日版 MEGA（TCGdex 全系无卡图）、日版火箭队与繁中变幻假面（秘密卡卡图缺失过多）、太晶庆典ex（TCGdex 稀有度数据大面积缺失）
- **卡槽概率模型**：普通/非普通/反闪/稀有四类卡槽，权重全公示（见战绩页与 `docs/PRD.md`）；新用户首包保底 AR 以上
- **分级演出（L0–L4）**：卡背漏光预告 → 3D 翻卡全息扫光 → RR 紫色星尘 → AR/UR 彩虹粒子雨 → SAR/金卡全屏金粉双爆 + 冲击波 + 闪光 + 震动
- **自研 Canvas 粒子引擎**（零依赖）+ **WebAudio 合成音效**（无音频素材）+ 3D 倾斜全息卡面查看
- **简中五弹官方封入率**（v2）：按 pokemon.cn 商品规格与官方生产配比模拟（平卡槽 + 闪卡槽、球纹/大师球纹样），10 万包模拟与官方分布偏差 ≤0.1pct；EN/JA/TW 为社区校准概率，战绩页双轨公示
- **行情 · 每包期望值**（v2）：对价格覆盖达标的 22 弹逐弹 Monte Carlo 4,000 包，算期望卡值 / 回本概率 / 出 SAR 期望包数，参考包价可改；首页收藏资产卡（估值 + 每日快照走势）、结算页回报率、弹卡期望徽标
- **开包战报**（v2）：结算页与历史双入口，一键生成竖版海报图（最佳卡 + 总值 + 回报率）保存分享
- **卡鉴**（v2）：选卡看本弹价格分位，四维（居中/边角/边缘/表面）评级预检给出预估评级区间——概念演示，对应评级业务接入点
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
