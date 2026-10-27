# 调研：开源开包项目与数据源（2026-10-27 实测）

## 参考项目
| 项目 | 形态 | 借鉴点 | 不足 |
|---|---|---|---|
| PokéRip (poke.rip) | 网页版开包模拟 | 数据来自 TCGdex；零售概率口径（5C/3U/1反闪/1稀有槽，稀有槽约 74% R / 14% UR / 6% Secret / 2% SIR+Hyper） | 演出弱，无分级特效/收藏闭环 |
| PokemonTcgSimulator (github.com/sohamSanat/PokemonTcgSimulator) | 全栈（Firebase） | Era-Calibrated 概率引擎、卡册、PSA 分级、PvP Pack-Off | 功能堆砌，开包演出不够聚焦 |
| TTS-PTCG-Pack-Simulator (github.com/Pepper0ni) | Tabletop Simulator 模组 | 以 API 拉真实弹系数据、封包数据考据严谨 | 非移动端形态 |
| PokeTCG Pulls（Android） | App | 逐张/自动揭晓、离线下载弹系、本机收藏 | 视觉与特效粗糙 |
| Pack Lab (inksighttcg) | 多 TCG 开包站 | 每张卡按 TCGplayer 每日价格计价 | 无演出层 |

## 数据源实测结论
- **TCGdex（采用）**：免费、无 Key、CORS 友好；`api.tcgdex.net/v2/{lang}/sets/{id}` 与 `/cards/{id}` 提供稀有度、画师、Cardmarket/TCGplayer 价格；卡图 `assets.tcgdex.net/{lang}/{series}/{set}/{no}/low.png|high.png` 实测 200。EN/JA 均覆盖 SV 时代弹系。
- **pokemontcg.io（备选）**：2026-10-27 实测接口返回 500，稳定性不如 TCGdex，未采用。
- 方案：构建期抓取全卡 → 静态 JSON 随站发布（913 张 / 4 弹 / gzip 后约 50KB），打开零等待、无限流风险；卡图仍走 CDN 不打包分发。

## 概率参照
官方未公布完整出率；采用 TCGplayer 大样本统计与 PokéRip 社区校准值做可玩性校准（SAR 综合约 3–5%/包，蒙特卡洛 3000 包实测），口径与免责见 PRD 第 5 节与产品内「概率公示」。

## 补充（完整调研见 research/github-and-data-research.md）
- **全息质感标杆**：simeydotme/pokemon-cards-css（8.3k★）——纯 CSS 全息实现，按稀有度分层（cosmos/rainbow/gold）+ CSS 变量跟随指针，本项目的 foil 分层即借鉴其思路重写（原项目 GPL-3.0，不直接复制代码）。
- **特效形态参考**：sohamSanat/PokemonTcgSimulator 的拖拽撕包 + Framer Motion；shazeus/pokemon-pack-simulator (Pack Forge) 的 TCGdex 接入与逐张揭示；Westerbay/Booster-Break 为少数 MIT 协议项目。
- **概率的弹间漂移（重要）**：TCGplayer 8000+ 包实测 SV Base 的 SIR 约 1/32 包，但 2024 年后常规弹漂移至约 1/85–90 包，Prismatic Evolutions 约 1/45——不存在统一出率，v2 应按「每弹一张概率表」维护。日版常规弹为盒配额制（30 包/盒，盒保底 SR+、AR≈3/盒），与单包独立随机不同；本作 v1 的日版 151（7 张特殊弹）已按其结构建模。
