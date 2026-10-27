# 宝可梦 TCG 开包模拟器 — GitHub / 数据源 / 真实概率调研

> 调研日期：2026-10-27（Asia/Shanghai）
> 目的：为新项目「真实弹系 + 真实概率 + 高质量开包动画/粒子特效 + 手机端优先」提供可借鉴的开源参考、数据源选型和概率模型依据。
> 方法：GitHub API 搜索（`pokemon tcg pack simulator` / `pokemon booster pack` / `tcg pack opening simulator`，按 star 排序）+ 仓库 README / package.json 直读 + 官方文档（docs.pokemontcg.io、tcgdex.dev）+ TCGplayer 大样本开包统计的二手整理（PullRates / PokeBeach / ThePriceDex）。Star 数为 2026-10-27 经 GitHub API 实测，会浮动；个别仓库因 API 限流以搜索缓存为准并已标注。
> 重要声明：宝可梦公司**从不公布单卡精确概率**。英文版概率金标准是 TCGplayer Authentication Center 的数千包实开统计；日版概率金标准是「整盒（box）保底结构」——盒级规则是结构性的、相对可靠，换算到单包的 SAR/UR 概率均为社区估算，本文一律标注置信度，不把估算写成官方数字。

---

## 0. 结论先行（给产品文档直接引用）

1. **没有一个开源项目同时做好了「真实弹系概率 + 日版数据 + 高级特效」三件事。** 这正是新项目的差异化空间：
   - 概率最认真的：`jwkeena`（老弹槽位模型）、`zsd7200/packrip`（按弹自有 pull rate）、`sohamSanat`（era-calibrated 引擎，自述）。
   - 特效最强的：`simeydotme/pokemon-cards-css`（8.3k star，全息效果事实标准，不是开包器而是特效库）。
   - 数据/架构最现代的：`shazeus/pokemon-pack-simulator`（Pack Forge，TCGdex + React 19 + 逐张揭示 + binder）、`Westerbay/Booster-Break`（全栈 TS + TCGdex/Scrydex，MIT 可复用）。
2. **数据源必须双源：TCGdex 为主（日版/多语言），pokemontcg.io 为辅（英文版 + 价格校验）。** 只用 pokemontcg.io 做不了日版原弹——它只有英文版卡，日本的双弹（如 SV1S Scarlet ex + SV1V Violet ex）在英文版被合并成一个 set。
3. **概率模型必须按「版本 × 弹类型」分开建模，不能用一套全局概率：**
   - 日版常规弹：5 张/包、30 包/盒、盒保底 1 张 SR 以上、AR 约 3/盒 —— 是「盒内配额」模型，单包独立随机是错的（至少保底逻辑错）。
   - 英文版常规弹：10 张/包（+能量+码卡）、36 包/盒、无盒保底 —— 是「槽位 + 槽内概率」模型，且 SIR 概率在 SV 时代内从 1/32 漂移到 1/85–90，不能写死。
4. **特效路线建议：CSS 全息层（借 pokemon-cards-css 的分层思路）+ Framer Motion 编排揭示流程 + Canvas 粒子（canvas-confetti / tsparticles 或自写轻量粒子）做 AR/SAR 爆点。** 纯 WebGL/Three.js 对手机端是过度工程，已调研项目无一采用。
5. **License 雷区：绝大多数开包模拟器仓库没有 LICENSE（无 license = 默认保留所有权利，不可直接复制代码，只能借鉴思路）。** 可安全复用代码的只有 MIT 的 Booster-Break、GPL-3.0 的 pokemon-cards-css / TTS 模拟器（GPL 有传染性，商用/闭源需评估）、MIT 的 TCG Pocket 统计脚本等，详见 §1.3。

---

## 1. GitHub 开源项目调研（10 个）

### 1.1 总表

| # | 仓库 | Star* | 语言/框架 | 数据源 | 动画/特效 | License | 可借鉴度 |
|---|------|-------|-----------|--------|-----------|---------|----------|
| 1 | [jwkeena/pokemon-booster-pack-simulator](https://github.com/jwkeena/pokemon-booster-pack-simulator) | 9 | 原生 JS/HTML/CSS，静态站 | 本地静态数据（自备卡表） | CSS 翻卡（flip all）、无动画库 | 无（未声明） | ★★★ 概率/槽位思路 |
| 2 | [sohamSanat/PokemonTcgSimulator](https://github.com/sohamSanat/PokemonTcgSimulator) | 2 | React 18 + TS + Vite 6 + Tailwind v4 + Firebase | 自建卡池 + TCGplayer 价格（自述） | **Framer Motion** + CSS 3D transform（rotateX/Y 倾斜）、拖拽撕包、holo shimmer | 无（未声明） | ★★★ 特效编排/产品形态（仅借鉴，勿抄码） |
| 3 | [shazeus/pokemon-pack-simulator](https://github.com/shazeus/pokemon-pack-simulator)（Pack Forge） | 2 | **React 19 + TS 6 + Vite 8**，可选 Express+JWT 后端 | **TCGdex API** | CSS transition：撕包、抽卡、翻卡、进度点、foil shine；package.json 无 GSAP/Framer（纯 CSS） | 无（未声明） | ★★★★ 数据接入/揭示流程/静态部署 |
| 4 | [rhysalmario/pokepack](https://github.com/rhysalmario/pokepack) | 4 | React + JS/HTML/CSS | Pokémon TCG API（pokemontcg.io，自述首个 API 项目） | CSS 基础动画 | 无（未声明） | ★★ 入门级结构参考 |
| 5 | [Westerbay/Booster-Break](https://github.com/Westerbay/Booster-Break) | 4 | TS 全栈：React+Vite+TanStack Router/Query+shadcn/ui+Tailwind；后端 Elysia（Bun）+Prisma+Postgres | **TCGdex + Scrydex**（运行时解析，不入库卡图） | 以功能为主，特效非卖点（shadcn/ui 常规动效） | **MIT** | ★★★★ 唯一可放心复用代码的现代全栈骨架 |
| 6 | [trungLyDal/pokemon-card-game](https://github.com/trungLyDal/pokemon-card-game) | 4 | React + Node/Express + MongoDB | Pokémon TCG API + 自建 Mongo 卡池 | CSS 开包动画 | 无（未声明） | ★★ 收藏画廊/筛选 |
| 7 | [zsd7200/packrip](https://github.com/zsd7200/packrip) | 0 | JavaScript | Pokémon TCG API + **多来源汇编的各弹自有 pull rate** | 基础 Web 交互（README 未强调动画） | 无（未声明） | ★★★ 「按弹概率表」数据组织方式 |
| 8 | [burgerhotdog/tcgp-sim](https://github.com/burgerhotdog/tcgp-sim) | 2 | JavaScript（npm/Vite 类） | TCG Pocket（tcgp）卡池（推定） | 轻量 | 无（未声明） | ★★ Pocket 玩法对照（5 张包、神包） |
| 9 | [Pepper0ni/TTS-PTCG-Pack-Simulator](https://github.com/Pepper0ni/TTS-PTCG-Pack-Simulator) | 12 | Lua（Tabletop Simulator 模组） | Pokémon TCG API（运行时拉取+缓存） | 依托 TTS 3D 物理（拖拽开包） | **GPL-3.0** | ★★ 槽位/能量替位等边缘规则处理 |
| 10 | [simeydotme/pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css) | **8,324** | CSS + Svelte 演示站 | 示例图用 images.pokemontcg.io | **纯 CSS：transform/gradient/mix-blend-mode/filter + CSS 变量跟随指针/陀螺仪**，按稀有度分效果 | **GPL-3.0** | ★★★★★ 全息特效事实标准，必研 |

\* Star 为 2026-10-27 GitHub API / 搜索缓存实测值，后续会变化。另有大量同名 0-star 练手仓库（`Vhalwan/…`、`JamieCee20/pokemon-tcg`、`illuminax13/…` 等）已筛除，不具参考价值。

补充素材仓库：[jpbutter/pokecard-assets](https://github.com/jpbutter/pokecard-assets)（1 star）——**日版各弹的补充包/盒包装美术图**，正是开包 UI 最缺的素材类型，值得单独评估其图片来源与授权（仓库未声明 license，图片版权归宝可梦公司，仅适合粉丝项目非商用场景）。

闭源但值得看产品形态的两个站（非 GitHub 开源，仅作竞品参考）：
- **PokéRip（poke.rip）**：基于 TCGdex、约 200 个 set、「tap & hold 撕包」，其 FAQ 公开了它的简化概率模型（5C+3U+1 反闪+1 稀有槽；稀有槽约 74% R/holo、14% UR、6% secret、2% SIR/Hyper）——简单好懂，但不是按弹真实概率。
- **PokéChase（pokechase.gg）**：按弹 pull rate + 实时市价估值 + 「追特定卡」模式，覆盖 SV 到 Mega Evolution，产品完成度高。

### 1.2 重点项目详解

#### ① jwkeena/pokemon-booster-pack-simulator — 概率严谨性的原型
- **功能**：静态 Web 应用，覆盖最初十余弹（Base Set 到 Neo Destiny 一带），宣称「accurately captures the probability, rarity distribution, and experience」；选弹 → 开包 → flip all 看结果；移动端响应式；曾是 Neocities 热门站，在线版 pokemonboosterpack.com。
- **概率实现**：按老弹真实包结构建模——每包 1 rare + 3 uncommon + 7 common（作者在 Reddit 的说明，社区指出细节仍在完善）。价值在于**槽位（slot）思维**：先定每包的槽位构成，再在槽内按池抽卡，而不是全池等概率乱抽。
- **特效**：原生 CSS/JS，无库。启示：老项目的特效普遍弱，新项目的护城河就在这里。
- **复用**：无 LICENSE，不可抄代码；槽位模型思想可借鉴。

#### ② sohamSanat/PokemonTcgSimulator — 产品形态最「满」的参考（2026 年新仓）
- **功能**（据 README 与 dev.to 介绍文章）：3D 开包（拖拽撕开包装）、PSA 评级模拟（centering/surface/corners/edges → 1–10 分 + slab 封装）、卡册 binder（拖拽、卡套动画、实时组合价值）、Rip N' Ship 直播模拟、1v1 Pack-Off 对战（Firebase Firestore 实时同步、5 位房间码）、NPC 卡商议价（Gemini）、拍卖行。覆盖 1999 Base Set 到 2025 Mega Evolution。
- **概率实现**：自述「Era-Calibrated Pack Engine」——按年代校准槽位权重、保底 holo、处理 Secret/Special Illustration Rare 的复杂概率。具体权重未公开验证，**只能当产品叙事参考，不能当概率数据源引用**。
- **特效实现**：**Framer Motion** 做编排 + CSS 3D transform 做实时 GPU 倾斜（rotateX/rotateY）+ 按卡面主色提取做光晕 + 分稀有度的 shimmer（holo / reverse-holo / rainbow / secret 各不同）。这是已调研项目里唯一明确用 Framer Motion 的，且明确 mobile-optimized、触摸撕包——**与新项目的技术路线最接近，重点借鉴其交互拆分（撕包手势 → 逐张倾斜鉴赏 → 汇总），不要借鉴其未验证的概率数字**。
- **复用**：无 LICENSE，只借鉴思路。

#### ③ shazeus/pokemon-pack-simulator（Pack Forge）— 数据接入最干净的现代实现
- **功能**：选弹（可搜索）→ 选包型（6/10/12 张）→ rip → 逐张揭示 → 本地 binder（localStorage 存已抽卡、重复计数、命中历史、当前弹完成度）；多语言弹切换（en/fr/de/es/it/pt-BR）；纯静态可部署 GitHub Pages；可选自托管账号后端（Express + JWT + bcrypt，Pages 版默认关）。
- **数据**：TCGdex 实时拉取 sets、set 详情、卡元数据、logo、symbol、卡图——**证明了「纯前端 + TCGdex 免 key」路线完全可行**，且不需要自建数据库就能覆盖多语言。
- **概率实现**：按稀有度分桶（common / uncommon / rare / hit 四桶）组包。简单，但**不是按弹真实槽位/盒配额**，这是它与新项目的差距点。
- **特效**：README 明言 booster rip、card draw、card flip、progress pips、foil shine；其 package.json（已直读）依赖只有 React 19、lucide-react、zod 等，**没有 GSAP/Framer/Canvas 库——特效全是 CSS transition/animation**。启示：中等特效用纯 CSS 可达；但新项目要的「AR/SAR 专属爆点 + 粒子」需要再上一层（见 §4）。
- **复用**：无 LICENSE，借鉴架构与 TCGdex 调用方式（API 调用本身不受代码版权限制）。

#### ④ Westerbay/Booster-Break — 唯一 MIT 的现代全栈骨架
- **功能**：开包 + 收藏 + 交易 + 三卡对决（PvP/Elo）；英/法双语界面。
- **架构**：Bun monorepo；前端 React+Vite+TanStack Router/Query+shadcn/ui+Tailwind；后端 Elysia + Prisma + Postgres；共享 TS contracts 包。其 README 的免责与合规写法值得直接学习：**仓库内不存放任何宝可梦卡图/包装图，元数据与图片 URL 运行时从 TCGdex/Scrydex 解析**——这是规避版权素材入库的正确姿势，新项目应照做。
- **复用**：**MIT，可复用代码**（需保留版权声明）。若新项目需要账号/收藏后端，这是成本最低的起点；但其开包特效不是重点，仍需自研。

#### ⑤ simeydotme/pokemon-cards-css — 全息特效的事实标准（必研，非开包器）
- **实现原理**：纯 CSS——`transform`（3D 倾斜）、多层 `background gradient`、`mix-blend-mode: color-dodge`、`filter`、闪粉/星云贴图，配合 JS 写入 CSS 变量（指针位置/设备姿态）驱动高光移动。Demo：poke-holo.simey.me，另有 151 专用版。
- **按稀有度分效果**（这正是新项目「AR/SAR 要有对应特效」的需求原型）：普通 holo 的彩虹渐变、cosmos/galaxy 星云闪、radiant、rainbow rare、gold/shiny 等各有独立处理层，靠卡的 rarity / supertype 等数据属性切换 class。
- **复用**：**GPL-3.0**——自研时借鉴其分层结构（卡面层 / glare 层 / sparkle 层 / 倾斜容器）是安全的；若直接移植代码，整个衍生作品需按 GPL 开源，商用前必须法务评估。另有 React 移植 `mopocop/holo-cards`（同 GPL-3.0，0 star）。

#### ⑥ 其余项目速评
- **rhysalmario/pokepack（4★）**：作者首个 React+API 项目，pokemontcg.io 接入 + 基础开包，适合看「最小可用版本」长什么样，无特效亮点。
- **trungLyDal/pokemon-card-game（4★）**：React + Express + MongoDB，卖点是收藏画廊与按名称/属性/稀有度/弹筛选、卡详情带市价；开包只有 CSS 动画。启示：binder/图鉴的筛选维度可参考。
- **zsd7200/packrip（0★）**：其自述一句话最关键——「uses the Pokémon TCG API … and pull rate data from various sources in an attempt to be accurate to each set's own pull rates」。即**承认官方 API 不给概率、概率表要自己按弹汇编维护**，这与 §3 的结论一致；其产品名也是 poke.rip 类站点的同源思路。
- **burgerhotdog/tcgp-sim（2★）**：针对手游 Pokémon TCG Pocket 的开包模拟（Pocket 是 5 张/包、含「神包」等独立规则），提醒新项目：**Pocket 弹（tcgp 系列）必须与实体卡弹分开建模**，不要混进 SV 实体弹的概率表。
- **Pepper0ni/TTS-PTCG-Pack-Simulator（12★，GPL-3.0）**：Tabletop Simulator 里的 3D 桌面开包，运行时调 pokemontcg.io 并缓存整弹数据；README 记录了一个真实边缘规则——「某些弹能量卡会替换随机 common 槽，能量位置并非随机」——说明槽位模型要预留「特殊替位」配置项。

### 1.3 License 总结（复用边界）

| 结论 | 仓库 |
|------|------|
| ✅ 可复用代码（保留声明） | Booster-Break（MIT）、carlospuenteg/Pokemon-TCG-Pocket-Simulator（MIT，Pocket 概率统计脚本）、Mitchk1995/pokerevolutionpacks（MIT） |
| ⚠️ 可复用但 GPL-3.0 传染 | pokemon-cards-css、TTS-PTCG-Pack-Simulator、PTCGPBPS（Pocket 开包站）——闭源/商用需评估，或只借鉴原理重写 |
| ⛔ 无 LICENSE = 不可复制代码 | jwkeena、sohamSanat、shazeus、rhysalmario、trungLyDal、zsd7200、burgerhotdog 等大多数——仅借鉴产品/算法思路 |
| ⛔ 素材版权独立于代码 | 所有卡图、logo、包装图版权归宝可梦公司/任天堂/Creatures/GAME FREAK；开源 license 不授予卡图权利。粉丝非商用 + 运行时外链官方图源（TCGdex/pokemontcg.io 的 CDN）是社区通行做法；商用需另行授权评估 |

---

## 2. 卡牌数据源调研

### 2.1 对比总表

| 维度 | Pokémon TCG API（pokemontcg.io） | TCGdex（tcgdex.net） | pokemon-tcg-data（GitHub 仓库） |
|------|----------------------------------|----------------------|--------------------------------|
| 维护方 | 社区（PokemonTCG 组织，现并入 Scrydex 生态演进） | 社区开源项目 TCGdex | 同 pokemontcg.io 的数据仓 |
| 覆盖 | **仅英文版**（美版发行体系，1999 Base 至今） | **多语言多版本**：en/fr/es/it/pt/de + **ja（日版）/ zh-tw（繁中）** / id / th；简中、韩语官方标注 coming soon、完成度不一 | 仅英文版（同 API） |
| 日版原弹 | ❌ 无（日版双弹被合并为英文单弹） | ✅ 有（如 SV1S/SV1V 分开），走 `/v2/ja/…` 路径最完整 | ❌ |
| API 形式 | REST JSON，`https://api.pokemontcg.io/v2` | REST JSON `https://api.tcgdex.net/v2/{lang}/…` + GraphQL `https://api.tcgdex.net/v2/graphql` + 多语言 SDK（TS/JS、Python、PHP、Java/Kotlin） | 无 API，Git 拉取 JSON 文件（按 set 分文件） |
| 鉴权/额度 | 无 key：**1,000 次/天、30 次/分钟**；有 key（免费申请，`X-Api-Key` 头）：**20,000 次/天**（官方 Rate Limits 文档，2026-10 复核） | **无需 key、免费**；官方未公布硬性限额（社区项目，应自加缓存、避免高频滥用）；数据本身开源可自托管 | 无额度（本地文件） |
| 按 set 查询 | `GET /v2/cards?q=set.id:sv1&page=1&pageSize=250`；`GET /v2/sets?q=series:"Scarlet & Violet"`；查询语法支持通配/范围/AND/OR | `GET /v2/{lang}/sets/{setId}` 直接返回该弹卡表（brief 列表）+ 单卡详情 `/v2/{lang}/cards/{cardId}`；列表端点支持过滤与分页 | 读对应 set 的 JSON 文件 |
| 卡图 | `images.small`（245×337 级）/ `images.large`（高清）；URL 规则：`https://images.pokemontcg.io/{setId}/{number}.png` 与 `…/{number}_hires.png` | API 返回无扩展名的图基址，如 `https://assets.tcgdex.net/en/swsh/swsh3/136`，自行拼 `/{quality}.{ext}`：quality = `high`（600×825）/ `low`（245×337）；ext = `webp`（推荐，透明底、体积小）/ `png` / `jpg`；set 的 logo/symbol 同理拼扩展名 | 不含图片，仅含图 URL 字段 |
| 稀有度字段 | 英文字段，如 `Common / Uncommon / Rare / Rare Holo / Double Rare / Illustration Rare / Special Illustration Rare / Hyper Rare / Ultra Rare / ACE SPEC Rare` 等（随年代变化，老弹有 Rare Rainbow/Secret Rare 等旧名） | `rarity` 字段随语言路径本地化；另有 category（Pokemon/Trainer/Energy）、illustrator、HP、攻击等完整字段；近年还整合了 Cardmarket/TCGplayer 价格字段（详情端点） | 同 API |
| 价格 | ✅ 内嵌 TCGplayer + Cardmarket 价格（更新于 prices.pokemontcg.io） | 部分整合（Cardmarket/TCGplayer，见其文档 markets-prices）；完整度不如 pokemontcg.io 稳定 | 同 API 快照 |
| 适合本项目 | 英文弹的权威卡表 + 估值展示 | **主数据源**：日版弹、多语言、Pocket（tcgp 系列含 booster 归属信息） | 离线缓存/构建时预置英文弹数据，绕开 API 限额 |

### 2.2 pokemontcg.io 使用要点
- 端点：`/v2/cards`、`/v2/cards/{id}`（id 如 `sv1-1`、`xy7-54`）、`/v2/sets`、`/v2/sets/{id}`、`/v2/series` 等。
- Set 对象关键字段：`id / name / series / printedTotal（不含 secret 的印刷总数）/ total（含 secret 总数）/ releaseDate / images.symbol / images.logo`。
- **坑**：① 只有英文版，做日版必须换源；② 稀有度是英文命名，与日版 C/U/R/RR/AR/SAR/SR/UR 体系不是一一同名（映射见 §3.4）；③ 无 key 额度很低（1,000/天），上线产品务必申请 key + 做服务端缓存或构建时预取；④ 社区维护，新弹入库有延迟。

### 2.3 TCGdex 使用要点（本项目主源）
- 路径规则：`https://api.tcgdex.net/v2/{lang}/cards|sets|series[/{id}]`，如日版某弹走 `/v2/ja/sets/…`、英文走 `/v2/en/sets/…`；同一卡在各语言下 ID 体系一致、文本本地化。
- **图片拼接规则（重要）**：返回值只给基址，必须自己拼 `/high.webp`（展示/鉴赏用，600×825）或 `/low.webp`（列表/缩略图，245×337）。手机端策略：binder/列表用 low，翻卡揭示与 AR/SAR 特写用 high 并预加载下一张。
- GraphQL 可一次取「弹 + 卡表 + 稀有度」减少往返；TS SDK 支持 `setLang()`、缓存 TTL 配置。
- **坑**：① 各语言完成度不同——日版卡在 `ja` 路径最全，`en` 路径查日版独占弹可能缺卡；接入时应「按弹的发行语言取数」而非全走一种语言。② 简体中文官方仍在完善中（繁中可用），产品若要中文卡面，短期只能用繁中或英文/日文卡面 + UI 中文。③ 无 key ≠ 无成本，自托管其开源数据库（tcgdex/cards-database）是流量做大后的退路。
- Pocket 支持：`tcgp` 系列单独组织，卡带 boosters 归属字段，适合未来扩展手游包。

### 2.4 选型建议
```
主链路：TCGdex（ja 取日版弹 / en 取英文弹）— 卡表、稀有度、卡图（assets.tcgdex.net）
增强：  pokemontcg.io（英文弹价格、与 TCGdex 交叉校验英文弹卡表）
离线：  构建时把已上线弹的卡表 JSON 预置进仓库/CDN（学 pokemon-tcg-data 与 TTS 模组的缓存做法），
        运行时只增量拉新弹 —— 同时解决限额、首屏速度和 API 抖动三个问题
自维护：每弹的「包结构 + 概率表」是独立的一份配置文件（见 §3.5），不依赖任何 API（API 不提供概率）
包装图：各弹 booster 包装图两个 API 都不稳定提供，需自备素材（参考 jpbutter/pokecard-assets 的收集范围），
        且只做粉丝非商用展示、图片不二次分发打包
```

---

## 3. 真实弹系概率调研

### 3.1 先分清三种「概率来源」的可信度
1. **结构性事实（高置信）**：每包张数、每盒包数、日版盒保底——来自产品规格与大量盒开验证，各零售商口径一致。
2. **大样本统计（中高置信）**：TCGplayer Authentication Center 实开 8,000+ 包（SV 基础弹，2023-03-31 发布）/ 1,200–1,500 包（特殊弹）后公布的分稀有度比例，是英文版最权威的二手数字源，PullRates、PokeBeach、ThePriceDex 均转引它。
3. **社区/零售商估算（低置信）**：日版 SAR/UR 的单包概率、神包概率等，无公开样本量，来源间互相矛盾（下文给出区间并标注）。**产品实现时应把这类数字做成可配置参数，并准备用自有模拟/用户开包数据校准，而不是写死为「官方概率」对外宣传。**

### 3.2 日版（日本版）— SV 系列（2023–2025）

**稀有度体系**：C（Common）/ U（Uncommon）/ R（Rare，闪）/ RR（Double Rare，宝可梦 ex）/ AR（Art Rare，全图画宝可梦）/ SR（Super/Secret Rare，全图宝可梦或训练家）/ SAR（Special Art Rare，特殊全图画）/ UR（Ultra Rare，金卡）/ 另有 ACE SPEC（SV 中期加入的道具类特殊稀有）、镜像闪（Poké Ball / Master Ball 图案反闪，仅特定弹）。

#### （a）常规弹（例：SV1S Scarlet ex / SV1V Violet ex，2023-01；SV2D Clay Burst；SV5a Crimson Haze 这类强化弹结构相近）
| 项目 | 内容 | 置信度/来源 |
|------|------|-------------|
| 每包 | **5 张** | 结构事实 |
| 每盒 | **30 包** | 结构事实 |
| 每盒保底 | **≥1 张 SR 或更高级（SR/SAR/UR）** | 结构事实（多家零售商与开盒指南一致；英文盒无此保底） |
| 每盒典型命中 | RR（ex）约 4–5 张（部分指南口径 6–8，含口径差异）；AR **约 3 张**；R 闪其余槽位居多 | 社区共识（Violet ex / Crimson Haze 等零售页与 TCGame 指南互证，AR=3/盒最稳定） |
| 换算单包（独立开包模式用） | AR ≈ 3/30 = **10%，约 1/10 包**；RR ≈ **13–17%，约 1/6–1/7.5 包**；SR 以上合计 ≈ 1/30 包起（保底折算） | 由盒结构换算 |
| **SAR 单包概率** | **无共识精确值**：SAR 只是「SR 以上」里的一个分支。社区口径从「约 1/3 盒出 1 张 SAR」（≈1/90 包）到更乐观的零售话术「约 1/盒」都有；保守聚合口径还有「1 SAR / 5–6 盒」的说法（多见于科普文，疑似把特定 chase 口径混入）。**建议产品默认取 ≈1/60–1/90 包（每盒约 33–50% 概率含 SAR）并标注社区估算，上线后校准** | ⚠️ 低置信，来源互相矛盾（Cambridge TCG 明确标注 SAR 为 low confidence、约 1/1–3 盒） |
| UR（金卡）单包 | 约 1/6–7 盒 1 张 → **≈0.5%，约 1/180–1/210 包** | ⚠️ 低置信（零售商估算，无样本量） |
| 神包（God Pack） | 常规弹一般无；神包是特定弹机制（见下） | — |

> ⚠️ 建模关键：日版是**盒配额制**。若产品做「连开一盒」模式，应按盒生成（先抽 SR 以上分支、AR 配额、RR 配额，再填充其余包），而不是 30 次独立单包随机——否则保底体验与真实开盒完全不同。单包散抽模式才用换算概率。

#### （b）特殊弹：Pokémon 151（SV2a，2023-06）
| 项目 | 内容 |
|------|------|
| 结构 | **7 张/包、20 包/盒**（与常规弹不同！） |
| 槽位（社区拆解，DoubleSleeved） | 槽1–3 普通 C；槽4 = AR / 反闪 / Master Ball 反闪；槽5 = R/RR/SR/SAR/UR；槽6–7 U |
| 盒特征 | 每盒 1 张 Master Ball 镜像卡（社区共识） |
| 概率表（该拆解文的假设值，作者自注为粗估） | AR 3/20 盒均 → 15%/包；RR 4/20 → 20%/包；SR 1.5/20 → 7.5%/包；**SAR 1/120 包（0.83%）**；UR 1/240 包（0.42%）；**神包 1/700 包**（神包内容：御三家进化链的 AR×4 + SAR×2，取 3 条链中的 2 条） |
| 另一零售口径（Hobby Collectors AU） | SAR 3.57%（1/28）、UR 2.86%（1/35）、IR/AR 7.71%（1/13）——**与上表差距数倍，明显偏乐观，疑似营销口径，不建议采用**；两相对照正说明 151 的 SAR 数字必须标低置信、取保守值 |

#### （c）High Class 弹（例：S12a VSTAR Universe 2022-12；SV4a Shiny Treasure ex；SV8a Terastal Festival ex；M2a Mega Dream ex 2025-11）
| 项目 | 内容 | 置信度 |
|------|------|--------|
| 结构 | **10 张/包、10 包/盒**；每包多闪、High Class 的 SV8a 甚至每包保底 1 张宝可梦 ex | 结构事实 |
| 每盒典型 | SR/SAR 保底级命中 ≥1；AR 约 3–4 张（M2a 口径：AR 约 3 + MA 保底 1 + 道具类 SR 1 + 额外 SR/SAR/MUR  wildcard） | 社区共识 |
| SAR | SV8a 类：约 1 SAR/盒的零售口径与「SAR ≈1/30+ 包（约 1/3 盒）」的聚合口径并存，仍属低置信；VSTAR Universe 口径为每盒 1 SAR + 2–3 AR | ⚠️ 低置信 |
| 神包 | VSTAR Universe：约 **2 神包 / 每箱 20 盒**（≈1/200 包量级，社区报告）；SV8a 有 Eevee 进化链 SAR 神包 | ⚠️ 社区报告 |

#### （d）Mega 时代新稀有（2025 起，供前瞻）
M2a 等引入 **MA（Mega Attack Rare）** 与 **MUR（Mega Ultra Rare，金底彩虹）**；社区估算 MUR 约 1/50 盒量级、MA 约 1/8 盒量级——均为低置信早期数据，产品若覆盖 Mega 弹需单独一版概率表并持续修订。

### 3.3 英文版（国际版）— Scarlet & Violet 系列（2023–2025）

**稀有度体系（英文命名）**：Common / Uncommon / Rare / Double Rare（ex）/ Ultra Rare（全图 ex、全图训练家）/ Illustration Rare（≈日版 AR）/ Special Illustration Rare（≈日版 SAR）/ Hyper Rare（金卡，≈日版 UR）/ ACE SPEC Rare。

#### （a）包结构（SV 起的新结构，结构事实）
- **10 张游戏卡/包 + 1 基本能量 + 1 码卡（code card）**，盒为 **36 包**（特殊弹如 151/Prismatic 无常规盒装，靠 ETB/礼盒分发）。
- 10 张构成：**4 Common + 3 Uncommon + 2 Reverse Holo 槽 + 1 Holo/稀有槽**，即每包至少 3 张闪（官方宣传口径「three guaranteed foil cards」）。
- 槽位替位规则（建模必须实现）：**Illustration Rare / Special Illustration Rare 替换第 2 个 Reverse Holo 槽**；Double Rare / Ultra Rare / Hyper Rare 等替换最后的稀有槽。所以一包的「大奖」可能出现在倒数第二张或最后一张，揭示顺序的产品设计应利用这一点。

#### （b）基础弹概率（SV Base，TCGplayer 8,000+ 包实测，2023-03-31 发布；中高置信）
| 稀有度 | 单包概率 | 约合 |
|--------|----------|------|
| Double Rare | 13.76% ±0.73% | **1/7 包** |
| Illustration Rare | 7.67% ±0.56% | **1/13 包** |
| Ultra Rare | 6.57% ±0.52% | **1/15 包** |
| Special Illustration Rare | 3.15% ±0.37% | **1/32 包** |
| Hyper Rare | 1.85% ±0.28% | **1/54 包** |
| 特定单卡（如某张 SIR） | — | 约 1/318 包（= 类别概率 ÷ 该类卡数） |

#### （c）⚠️ 概率随弹漂移（近两年最重要的发现：不能用 (b) 一套打天下）
| 弹 | SIR 概率 | 其他要点 | 来源 |
|----|----------|----------|------|
| SV 中后期常规弹（2024，Surging Sparks 等） | **约 1/85–1/90 包** | Hyper 约 1/180 包；IR 约 1/13 包 | TCGplayer 数据经 PokeBeach 转引 |
| Journey Together（2025-03） | **约 1/86 包**（特定单卡约 1/518） | DR 约 1/5、IR 1/12、UR 1/15、Hyper 1/137 | PullRates 转引 TCGplayer 8,000+ 包口径（注：其 DR 口径与早期弹不同，疑含统计口径差异，采用时以 SIR/IR/UR 为主） |
| Prismatic Evolutions（特殊弹，2025-01） | **1/45 包**（但池中有 32 张 SIR，特定单卡 Umbreon ex 约 1/1,440） | 无普通 IR；UR 1/13；ACE SPEC 1/21；Hyper 1/180；Poké Ball 反闪 1/3、Master Ball 反闪 1/20；1,200 包样本 | TCGplayer 经 PokeBeach |
| 英文 151（特殊弹） | 约 1/32 包（社区聚合口径） | DR 1/8、UR 1/16、IR 1/12、Hyper 1/51 | 社区聚合（PokéPatch），置信低于 TCGplayer 直引 |

结论：英文 SIR 在 SV 时代经历了 **1/32（早期）→ 1/85–90（2024 常规弹）→ 特殊弹单独定价（1/45 等）** 的变化。产品必须**每弹一张概率表**，并在 UI 上诚实展示该弹的概率表与数据来源，这本身就是与 PokéRip（一套通用概率打天下）的差异化。

#### （d）非官方简化模型对照（竞品）
PokéRip 的公开模型：每包 5C+3U+1 反闪+1 稀有槽，稀有槽 74% R/holo、14% UR(ex)、6% secret、2% SIR/Hyper。这是 SWSH 时代的 10 张结构近似，**与 SV 的双反闪槽结构不符**，新项目不要沿用。

### 3.4 日英稀有度映射（做双版本同一弹时用）
| 日版 | 英文版 | 备注 |
|------|--------|------|
| C / U / R | Common / Uncommon / Rare | R 在日版基本为闪卡；英文 Rare 槽即 holo 槽 |
| RR | Double Rare | 均为普通宝可梦 ex |
| AR | Illustration Rare | 全图画、非 ex 为主 |
| SR | Ultra Rare 的一部分 | 日版 SR 包含全图宝可梦与全图训练家；英文 Ultra Rare 同义 |
| SAR | Special Illustration Rare（SIR） | 全场景特殊绘画 ex/训练家 |
| UR | Hyper Rare | 金卡 |
| ACE SPEC | ACE SPEC Rare | 粉红底特殊道具/能量，两版同名 |
| 镜像闪（球纹反闪） | Poké Ball / Master Ball Reverse Holo | 仅 151、Prismatic/Terastal 等特定弹 |

⚠️ 同一弹的日英构成并不相同：日版常是双弹拆分（如 SV1S+SV1V → 英文 SV Base 合并）、卡数与 secret 池不同、发售时间差 2–3 个月。**产品数据模型应以「发行版本（ja/en）+ set id」为弹的唯一键，不要试图把日英弹合并。**

### 3.5 给概率引擎的落地结构（建议）
```yaml
# 每弹一份配置（示例：日版常规弹）
set_id: sv1v            # TCGdex 的 set id
region: ja
pack:
  cards_per_pack: 5
  packs_per_box: 30
  mode: box_quota       # ja_standard 用盒配额；en 用 slot_probability；特殊弹单独 mode
  box_quota:
    sr_or_above: { count: 1, pool_weights: { SR: 0.62, SAR: 0.30, UR: 0.08 } }  # ⚠️ 社区估算，需校准
    ar:  { count: 3 }
    rr:  { count_range: [4, 5] }
  god_pack: null
# 示例：英文常规弹
set_id: sv1             # pokemontcg.io / TCGdex en 的 set id
region: en
pack:
  cards_per_pack: 10    # 另附 energy + code，不入揭示队列或作彩蛋位
  mode: slot_probability
  slots:
    - { type: common, count: 4 }
    - { type: uncommon, count: 3 }
    - { type: reverse_1, pool: any }   # 任意稀有度出反闪版
    - { type: reverse_2, upgrades: { illustration_rare: 0.0767, special_illustration_rare: 0.0315 } }  # 按该弹表
    - { type: rare_slot, upgrades: { double_rare: 0.1376, ultra_rare: 0.0657, hyper_rare: 0.0185, else: holo_rare } }
source: "TCGplayer Authentication Center 8000+ packs, 2023-03-31"  # 每份配置必须带来源与置信度字段
confidence: medium_high
```

---

## 4. 动画 / 特效实现方式横向总结（指导自研选型）

| 层 | 已验证的做法（来源项目） | 新项目建议 |
|----|--------------------------|------------|
| 卡面全息 | 纯 CSS 多层：gradient 光谱 + `mix-blend-mode: color-dodge` + sparkle 贴图 + CSS 变量跟随指针（pokemon-cards-css）；按 rarity 切 class（cosmos/rainbow/gold 各一套） | 直接按此分层自研（避 GPL 抄码）：`tilt 容器 → 卡图 → glare 层 → sparkle 层 → 边框辉光`；AR 用全图画 + 轻 glare，SAR 加星尘 sparkle + 更强光谱，UR/Hyper 用金色系滤镜层，RR/ex 用标准 holo |
| 撕包 | 拖拽/长按撕开（sohamSanat 的 drag slice、PokéRip 的 tap & hold）；CSS clip-path/transform 分离包装上下片 | 手势（touch drag）+ Framer Motion 弹簧物理；包装图自备（§2.4） |
| 逐张揭示 | 翻卡（CSS 3D flip，jwkeena 起各家通用）+ 进度点 + foil shine 扫光（Pack Forge） | Framer Motion 编排队列；稀有卡前一张开始「蓄力」——背景变暗、环境粒子聚集，制造期待感（真实开包的「慢翻最后一张」仪式） |
| 粒子爆点 | **已调研的开源开包器无一内置粒子系统**（这是空白点）；直播/抽卡类产品通行做法是 canvas-confetti 或 tsparticles | AR：小规模彩带/光点；SAR：全屏粒子爆发 + 屏幕辉光 + 震动（navigator.vibrate，移动端）；UR/Hyper：金色粒子雨。用 Canvas 2D 粒子即可，控制同屏粒子数（≤150）保手机帧率；不用 WebGL |
| 倾斜鉴赏 | 指针/陀螺仪驱动 rotateX/rotateY（pokemon-cards-css、sohamSanat 的 GPU tilt + 主色提取光晕） | 揭示后单卡鉴赏态标配；移动端用 DeviceOrientation 需处理 iOS 权限，默认以触摸拖动替代 |
| 音效/震动 | 开源项目普遍缺失 | Web Audio 合成撕纸/闪卡音（避免素材版权）+ 分级震动，是低成本高感知项，建议纳入产品文档 |

性能红线（手机端）：high 图 600×825/webp 约百 KB 级，整包预加载要做懒加载+预取下一张；全息层避免大面积 `filter: blur` 实时运算；粒子与倾斜在低端机型提供降级开关。

---

## 5. 风险与待确认

1. **版权**：卡图/包装图/Logo 版权归宝可梦公司等权利方。社区通行做法是粉丝非商用 + 运行时外链 TCGdex/pokemontcg.io CDN + 显著免责声明（学 Booster-Break README）。一旦涉及收费/商用，必须先做授权评估——此结论需同步进产品文档的风险章节。
2. **概率宣传合规**：对外展示的概率必须带来源与「社区估算」标注，尤其日版 SAR/UR 与神包概率（本文已标低置信项）。切勿把估算写成「官方概率」。
3. **TCGdex 日版数据完整度**：正式开发前需抽测目标弹（如 SV1V、SV2a、SV8a）在 `/v2/ja/` 下的卡表完整度与 high 图可用率，再定首发弹清单。
4. **pokemontcg.io 额度**：英文价格功能若上线，需申请 API key（20,000/天）并做缓存；无 key 的 1,000/天只够开发调试。
5. **GPL 传染**：若决定移植 pokemon-cards-css 代码而非重写，需先定新仓库的开源策略。

---

## 6. 主要来源

- GitHub API 仓库搜索与元数据（2026-10-27 实测）；各仓库 README/package.json 原文（jwkeena、sohamSanat、shazeus、Westerbay、trungLyDal、zsd7200、Pepper0ni、simeydotme）。
- Pokémon TCG API 官方文档：docs.pokemontcg.io（Rate Limits 页：无 key 1,000/天·30/分钟，有 key 20,000/天；Card/Set 对象页：images.small/large 与 URL 规则）。
- TCGdex 官方文档：tcgdex.dev（多语言列表、Assets 页：`assets.tcgdex.net/{lang}/{series}/{set}/{id}/{high|low}.{webp|png|jpg}`、600×825 与 245×337；REST/GraphQL 与 SDK 说明）。
- 英文概率：TCGplayer Authentication Center 8,000+ 包统计（2023-03-31），经 PullRates（pullrates.com/set/scarlet-and-violet）、ThePriceDex、Magic Madhouse 转引互证；Prismatic Evolutions 1,200 包数据经 PokeBeach（2025-01）转引；Journey Together 数据经 PullRates 转引。
- 日版结构与概率：Stonebrook Collectibles（SV1V 盒结构）、Hobby Collectors Australia / Pacific TCG（SV5a、SV2a）、TCGame 指南（日版三类弹结构总览）、DoubleSleeved（151 槽位与概率假设）、Cambridge TCG（日版概率置信度分级，SAR 标 low confidence）。
- 竞品公开说明：poke.rip FAQ（TCGdex 数据源与简化概率模型）、pokechase.gg（按弹 pull rate + 市价）。

*注：本文所有 GitHub 链接均为搜索/API 返回的真实仓库地址；概率数字均标注来源与置信度，低置信项在产品落地时应做成可配置参数并持续校准。*
