# 证据表：Personal Agent × WebMCP

访问与整理日期：2026-10-17。以下为官方文档、产品方资料、Devpost 作者自述；没有独立运行其产品或复现其性能。表中的影响是我们的研究判断。网页可能含赛后更新，不能从当前功能倒推获奖原因。

## 赛事和技术

| 来源 | 已读资料支持什么 | 对选题的影响 |
|---|---|---|
| [Cal Hacks 13.0](https://cal-hacks-13-0.devpost.com/) | 评审为 Application、Intentionality、Functionality、Creativity、Technical Complexity；3 分钟 pitch、2 分钟问答；要求项目仓库和本地演示录像；项目工作须在比赛期间完成 | 优先完整的小闭环。网页抓取工具失败后通过 curl 读取公开原始 HTML；未获悉五项权重 |
| [Cal Hacks 官网](https://www.calhacks.io/) | 36 小时活动描述；允许事先构思，项目实现须在赛时 | 本轮只输出研究文档 |
| [WebMCP Challenge](https://webmcp.devpost.com/) | 2026-08-25 至 09-04 的独立赛事，现已结束；强调人与 Agent 共同操作 | 只作案例参考，不能把其参赛规则当作 Cal Hacks 规则 |
| [WebMCP gallery](https://webmcp.devpost.com/project-gallery) | 本轮页面显示 2,473 个条目，并给部分条目标 Winner | 样本多但本研究并未逐一审计；无“全领域未出现”结论 |
| [Chrome 总览](https://developer.chrome.com/docs/ai/webmcp) | WebMCP 暴露网站语义工具，仍处于演进与实验支持阶段 | 固定演示浏览器，不能假设所有浏览器默认支持 |
| [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) | 当前使用 document.modelContext；工具注册、发现、执行；跨源 frame 有明确授权要求 | WebMCP 不是任意网站万能遥控器；产品第一版优先同源 |
| [WebMCP 草案](https://webmachinelearning.github.io/webmcp/) | Document 绑定的工具接口；草案状态 | 不宣称正式 W3C 标准；后台调度、持久记忆另建 |
| [规范 PR #184](https://github.com/webmachinelearning/webmcp/pull/184) | 2026-05-27 合并从 navigator 到 Document 的 getter 迁移 | 旧示例不能不加核对地复制 |
| [GoogleChromeLabs 示例扩展](https://github.com/GoogleChromeLabs/webmcp-extension) | 侧栏 Agent 发现和调用网页工具；当前 README 要求 Chrome 155+、Node 22.18+；每个 tab 独立会话 | 示例不是生产承诺，也不自动提供跨 tab 的共享记忆；本轮未安装运行 |
| [Page Agent 示例](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos/page-agent) | 展示页面 Agent 与 iframe 工具；包含 polyfill 路径 | 示例能跑不等于原生协议链路已验证 |
| [WebMCP Evals](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-evals) | 提供 smoke、browser、simulate 等评测方式 | 后续固定终态评测可参考；本轮未运行 |

## 成熟产品和基础设施

| 产品 | 官方材料中的重叠 | 研究判断 |
|---|---|---|
| [Reclaim Habit Agent](https://help.reclaim.ai/en/articles/17124978-habit-agent-overview-automate-recurring-routines) | 偏好驱动的习惯安排、移动、最小时长与人工移动后的锁定 | 普通个人日程修复差异不足 |
| [Motion](https://www.usemotion.com/help/time-management/auto-scheduling/reference-auto-scheduling/how-auto-scheduling-works-behind-the-scenes) | 冲突后的任务重新排期 | 自动重排本身不新 |
| [Amazon Alexa for Shopping](https://www.aboutamazon.com/news/retail/alexa-for-shopping-ai-assistant) | 购物偏好、购买历史、对话与代购能力 | 泛个性化购物面对成熟产品 |
| [ReturnQueen](https://returnqueen.com/return) | 集中管理退货、标签、期限、取件和退款跟踪 | 退货提醒或订单面板不够；真实物流是它的优势 |
| [Ohai](https://www.ohai.ai/) | 家庭日历、信息转任务、家务与膳食协调 | 家庭万能助手范围大且已有竞争 |
| [Bardeen](https://www.bardeen.ai/posts/automation-assistant-beta) | 观察操作与模式、生成自动化 | “示范一次就会做”不能单独作为新颖性 |
| [Mem0 OpenMemory](https://mem0.ai/blog/introducing-openmemory-mcp) | 跨 MCP 客户端的共享持久记忆和管理 UI | 个人记忆库本身已有基础设施 |
| [Visa Intelligent Commerce](https://www.visa.com/en-us/solutions/intelligent-commerce) | Agent 交易相关凭证、控制和认证能力 | 消费场景可有赞助契合，但未证实黑客松可取得哪些接口 |
| [Visa 消费者研究](https://corporate.visa.com/en/products/intelligent-commerce/earning-trust-report.html) | 讨论购物与购后事务及用户控制需求 | 厂商问卷只能支持研究背景，不能当作本项目需求验证 |

## WebMCP 项目样本

| 项目 | 作者描述的能力 | 对当前假设的反证或启发 |
|---|---|---|
| [Aisle · Winner](https://devpost.com/software/aisle-ai-wedding-seating) | 席位规划、锁定、少量移动修复冲突、接受与撤回提案 | 最小扰动修复已有完整案例 |
| [Alza · Winner](https://devpost.com/software/alza) | 2D/3D 空间、几何检查、自修复、跨源供应商工具 | 可视化、自检、跨站组合不构成独占差异 |
| [Bouquet Studio · Winner](https://devpost.com/software/bouquet-studio) | 意图转花束，人和 Agent 调整花材构图，版本与撤销 | 好的借鉴是可见结果与完整体验 |
| [Runline](https://devpost.com/software/runline) | 活动/周课表扰动修复，锁定、受影响者确认、备选、版本保护 | 原日程提案的直接同类；其生产身份与外部日历仍属后续工作 |
| [Day Canvas](https://devpost.com/software/day-canvas) | Agent 和人共用日程画布，增删移动与空闲时间查询 | “说一句，日历变了”已有直接样本 |
| [Moodle WebMCP](https://devpost.com/software/openlms-webmcp) | Moodle 插件、作业课程读取、学习计划与 rubric 辅助 | 泛校园学习助手不空白；深度真实集成更有价值 |
| [Recall](https://devpost.com/software/recall-user-controlled-ai-memory) | 用户可控记忆、工具权限、短期能力与撤销 | 记忆所有权和权限不是新增卖点 |
| [Mandate · Winner](https://devpost.com/software/mandate-ix29ek) | 记录/字段/时间范围授权，动态工具与服务端校验 | 通用授权层差异不足 |
| [Accessible Action Mode](https://devpost.com/software/accessible-action-mode-returns-exchanges) | 条件式多商品退换；作者明确 Shopify 只读、执行是本地模拟 | 退换货组合方案已有直接重叠；别把模拟申请说成真实退款 |
| [ProofDone](https://devpost.com/software/proofdone) | 取消、退款、履约多个条件核验；过期提案与重复执行处理 | “核验后才算完成”已有专门项目 |
| [RelayPay](https://devpost.com/software/relaypay) | 退款未到账的调查、升级和核验 | 售后追回款项不是空白；作者说明当前确定性演示 |
| [Concord](https://devpost.com/software/concord-an-agent-that-cannot-overpromise) | 跨源旅行事务、补偿、恢复和回执 | 跨站 rollback/receipt 本身也已有先例 |
| [Spokes](https://devpost.com/software/spokes-sd13ax) | 多个个人 Agent 在地图协商，公开/私有约束与无解处理 | 多 Agent 私密协商不宜作为唯一创新 |
| [Waggle](https://devpost.com/software/waggle-webmcp) | 记忆更正、精确人工批准、重新召回、lineage、旧版本提案拒绝 | 对记忆修复提案最重要的近邻。差异必须在已生成任务的依赖与局部重规划上 |
| [Lorekeeper](https://devpost.com/software/extenddb-memory-ledger) | 人与 Agent 共写记忆，条件更新保护人工修正 | 版本检查不新；是可靠实现应有的性质 |
| [GroundTrace](https://devpost.com/software/groundtrace-webmcp) | 给操作记忆附结果、来源和验证状态，决定可否依赖 | 有来源不等于可直接行动；但非本轮主选方向 |

## 同名实体与证据边界

[Devpost Deputy](https://devpost.com/software/deputy) 与 [Razin Deputy](https://razin.ai/deputy) 不应视为同一个项目。前者作者页描述示范推导工具；后者介绍网页表单/控件到工具的桥接。研究中出现的合并认定已经撤回；主结论不依赖这条有歧义的比较。

本表没有复刻网页全文、采用项目自报性能数据，或根据 Winner 标记推断确切获奖因果。上述链接用于后续逐项复查。
