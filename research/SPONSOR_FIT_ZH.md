# Cal Hacks 13.0：赞助赛道适配

核对日期：2026-10-17。基于“个人记忆纠正 → 已生成计划的局部修复”方案。以下是产品与技术适配建议，不是已确认的参赛资格。

## 更新：针对增量 Agent 运行时的 Convex 方案

用户后续选择深入动态环境、依赖重验和增量修复；完整设计见 [技术与评测协议](./TECHNICAL_RUNTIME_EVAL_ZH.md)。本节更新 Convex 定位，后文保留早期购物方案供参考。

2026-10-17 再次读取本届 Devpost，确认列有 `[Convex] Best use of Convex`；未取得额外的本届细则。Convex 自办的 All Gas 或历史 Zero to One 活动是不同赛事，其部署、插件、社交发布和评分要求不能移植成本届要求。

### 推荐主张

“用 Convex 的响应式状态、事务和持久工作流，让个人 Agent 在用户持续修改任务时，保持可观察、可恢复，并只修复受影响的决定。”这是项目建议，不是对获奖概率或官方评分权重的判断。

Convex 承担三个核心职责：

1. **共享状态与展示**：任务、偏好、库存、购物车、锁定项、依赖记录、待执行命令和回执持久化。人、浏览器 Agent 和观察界面订阅对应 query；组件内部状态不能作为权威来源。
2. **原子状态转换与安排修复**：同一 mutation 修改业务状态、记录变更并安排后续修复；大图可只记录变更和修复任务，再分批计算失效闭包，避免大事务。`scheduler.runAfter` 在 mutation 中的调度与数据修改一起提交。已运行的旧规划仍可能返回，因此提交时必须检查应用自己保存的依赖版本、任务代次或条件，不能只依赖原生 OCC。
3. **持久执行协调**：Workflow component 保存步骤结果、等待事件、管理恢复。LLM 调用放 action；数据库验证和提交放 mutation。浏览器通过命令订阅、原子领取和回执把真实 WebMCP 工具执行接入工作流。

Convex 的 query 依赖追踪不会自动生成 Agent 的业务依赖，也不会因为订阅更新自动启动后端工作流。依赖图与失效算法由我们实现；状态变更的服务端入口显式安排修复任务。

### 具体执行链路

1. 用户通过 `updateRequirement` mutation 改人数或预算。
2. mutation 保存变更、应用版本与修复请求；原子安排处理请求。
3. 修复过程读取受影响范围，必要时由 action 调用模型，产出携带依赖见证的提案。
4. `publishPlan` mutation 检查提案仍基于有效条件；过期则保留新状态并安排再次修复。
5. 浏览器订阅 `getPendingCommands`，通过 mutation 领取命令，然后调用页面真实的 WebMCP 工具。
6. 受控商店的写入通过 mutation 校验条件并更新库存/购物车/操作回执；浏览器把结果反馈工作流。
7. 所有观察界面通过 query 看到相同任务的已提交状态。网络到达时间可以不同，不能宣传跨设备零延迟同步。

Workflow 恢复不保证外部商家操作恰好执行一次；外部副作用仍需幂等键和回执查询。关闭执行 WebMCP 的浏览器后，服务端状态和工作流可保留，但网页操作必须等待可用浏览器，不能宣称浏览器关闭后仍能操作该页面。

### 赛道演示与证据

现场用执行窗口和用户窗口：Agent 已读取方案后，用户修改预算；释放旧模型响应，展示旧提案无法覆盖新要求；随后只修复受影响部分。再刷新执行窗口，展示持久任务恢复和已确认操作不重复执行。观察窗口实时显示任务、版本、命令和回执。

面向 Convex 的功能证据：多客户端修改到展示的实测延迟、并发场景中被错误接受的旧提案数、重复副作用数、恢复成功率和耗时。面向算法的证据：三个 Agent 基线全部共用 Convex 后端，比较成功率、模型/工具成本与修复范围。不能用“我方有事务、基线没有事务”的对照证明算法优势。

优先使用 Database、reactive queries、mutations、Actions 和 Workflow。Agent component 可用于对话、工具轨迹与用量管理，但并非已确认的赛道要求；不为功能数量额外添加 RAG 或向量搜索。

官方依据：[Realtime](https://docs.convex.dev/realtime)、[OCC 与原子性](https://docs.convex.dev/database/advanced/occ)、[原子调度](https://docs.convex.dev/scheduling/scheduled-functions)、[Actions](https://docs.convex.dev/functions/actions)、[Workflow](https://github.com/convex/workflow)、[Agent component](https://docs.convex.dev/agents/overview)。

## 推荐组合

消费者产品定位：**一个能随你的实际生活变化调整餐食与采购、保留已买物品和聚餐例外的个人购物 Agent。**

优先考虑 Visa 的购物主题 + Convex 的共享状态 + Gemini 的理解与工具调用。三者各承担一个确实需要的部分。Visa 是否要求指定 API、实际支付或 sandbox 流程仍待赛道细则确认。

| 赛道 | 已核实内容 | 产品要怎样适配 | 演示里给出的证据 |
|---|---|---|---|
| Visa — Reimagining Shopping | [官方比赛页](https://cal-hacks-13-0.devpost.com/)列有该赛道及 $5,000 奖项；未见完整技术要求 | 从“记忆管理”转成“购物决策随情况变化”；展示份量、已购库存、预算和聚餐例外对未提交购物篮的影响 | 同一商品目录下，修改前后的具体数量/预计金额、被保留的物品、用户审阅后的新购物篮。不能把预计金额减少说成实际省钱 |
| Convex — Best use of Convex | 比赛页列有赛道；[官方文档](https://docs.convex.dev/realtime)支持实时查询，[事务文档](https://docs.convex.dev/database/advanced/occ)说明原子性及并发控制 | 用 Convex 存记忆版本、计划、待买项、已购项、锁定和提案；UI 与 WebMCP 操作同一状态 | 用户改动后，Agent 的旧方案不能覆盖新数据；重新规划后相关对象一起更新，多个界面显示一致 |
| Gemini — Best Use of Gemini API | [MLH 本届页面](https://www.mlh.com/events/cal-hacks-13-0)公开列有该奖项，强调用 Gemini 构建 AI 应用 | Gemini 理解长期事实与一次性例外、生成修复计划、通过宿主调用 WebMCP；可选读取购物小票，经用户核对后标记已购 | 自然语言纠正中保留正确范围；小票识别确实改变哪些东西不再需要买；展示真实模型调用而非额外装饰性聊天框 |
| SpacetimeDB — 专门使用奖项 | [Spacetime 官方活动文章](https://spacetimedb.com/blog/spacetime-at-calhacks)确认将奖励令人印象深刻的 Spacetime 使用；该文未给完整规则/金额 | 作为 Convex 的替代；若团队擅长它，可用来实现多个室友与 Agent 同时编辑的购物状态 | 两人同时编辑、一个 Agent 重规划，所有端一致，已锁定和已购项保留 |
| Fetch.ai — Best Use of Fetch.ai | 比赛页列一等奖 $1,500、二等奖 $1,000、三等奖 $500；[官方活动页](https://www.fetch.ai/events/calhacks-13-0)确认参与 | 只有在 Fetch 真正承担 Agent 的发现、协作或执行角色时考虑；具体用哪个 SDK/服务等待细则 | 能指出某个必要任务实际经过 Fetch，并展示运行结果；若只是加名字或无用 Agent，不值得增加复杂度 |

## 同一个三分钟故事怎样服务多个赛道

1. 用一张明确标注来源的小票或已购清单作为输入；用户核对识别出的商品与数量。
2. 展示因错误家庭人数而过量的未提交购物篮，和导致它的个人记忆。
3. 用户纠正：“我平时一个人；周五聚餐仍四人；买过的保留；剩下这周按我的预算安排。”
4. Gemini 理解范围，Agent 读取页面 WebMCP 工具，提出新的餐食与购物篮。
5. 用户手动锁定一项；旧提案失效，Agent 按共享状态重算。Convex 或 SpacetimeDB 承担状态一致性。
6. 显示最终份量、待买清单和预计金额，用户确认后保存。在明确可用的测试结账接口中可继续演示，但没有接口时不能伪称完成支付。

Visa 评委看到购物体验；数据库赞助方看到真实并发与一致性用途；Gemini 评委看到模型如何改变决策。核心仍是同一个用户任务。

## 必须自行实现的边界

- Convex 自动处理数据库事务冲突，不会自动发现十秒前的 LLM 方案已经过期。提案仍须携带相关对象版本，apply 时由业务逻辑比较并拒绝过期方案。
- 商品数量和金额由代码算，模型负责理解和建议。减少购物篮金额不等于用户已实际省下这些钱。
- Gemini function calling 与 WebMCP 是两层接口：宿主取得网页工具并给模型提供调用能力，再在网页执行；只调用后端函数不能标为完成原生 WebMCP 链路。
- 小票图像理解是建议加分项，并非 Gemini 赛道公开要求。避免在基本流程未完成时引入 OCR 和商品匹配范围。
- Convex 与 SpacetimeDB 二选一。Fetch 也不应只为了奖项加入额外执行层。

## 其他赛道如何看待

Figma 的 Best Design 可作为产品设计工作的附带候选；Best Use Case of Figma Agent 与“用 Figma 画过草图”并非同一概念，其认定须读细则。不要为此把最终产品扩成设计工具。

CREAO 的 AI-First Disruptor、One-Person Company、Team Empowerment，Microsoft 的 Built for the Real World / Customer Impact，都在本届比赛页列出。但已读公开页未给足完整使用要求。当前消费者方案只能说明潜在主题关系，不能声称已经合格。

如果团队愿意改变目标用户，可把相似的规划能力用于小型餐饮经营者：客户改人数后联动菜单、采购与成本草案，这会让 One-Person Company 的产品叙事更自然。但客户授权、真实接入与功能边界都会改变；不建议在现有个人购物方案上临时堆企业模块。

Hyphenate 的主题明确为企业金融自治系统，Factory 列的是 Droid SDK 使用奖。现有餐食与购物方案不能仅凭预算栏或开发时使用 AI 就推定符合；本轮不优先追逐。

## 开始实现前需要确认的三点

1. Visa：仅需重新构想购物体验，还是必须集成指定 Visa API？测试购物车/sandbox 是否足够，是否要求支付？
2. Agent 类赞助方：必须使用哪些 SDK、服务、部署或注册方式？开发时使用与产品运行时使用是否都算？
3. 主办方：可申报多少赞助赛道，是否有组合限制，是否需要分别提交视频或额外表单？

这些信息目前没有从已读公开页面得到确定答案。可以先准备同一条核心用户流程，拿到细则后选择技术接口，不为未知条件提前过度建设。

技术资料：[Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)、[Gemini 图像理解](https://ai.google.dev/gemini-api/docs/image-understanding)、[Convex Realtime](https://docs.convex.dev/realtime)、[Convex OCC 与原子性](https://docs.convex.dev/database/advanced/occ)。
