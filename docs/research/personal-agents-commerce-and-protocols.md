# Personal Agents, Commerce, and Protocol Boundaries

**Reviewed:** October 18, 2026, America/Los_Angeles. **Status:** source research and proposed integration designs. No payment, authorization flow, protocol implementation, deployment, or experiment was executed.

The practical recommendation is to keep our Convex mission runtime and make browser commerce and company protocols replaceable adapters. Start with a controlled application; add Link only after its access and checkout path work, and treat PAP as a concrete draft integration with its own implementation work. None of these integrations establishes the value of incremental repair without a fair evaluation.

Read with the [runtime](../03-personal-agent-runtime.md), [model layer](../04-model-and-decision-layer.md), [language and browser integration](../12-typescript-rust-convex-webmcp.md), and [evaluation plan](../06-evaluation-and-experiments.md).

## 1. Source facts, separated from our proposals

### Stripe announcement: September 29, 2026

Stripe announces improvements to purchase completion, consumer-permissioned financial insights, and eligible purchase protections. The examples include extra checkout costs and customer intervention for payment authentication. Protection availability is conditional, with Muse identified as the first participating agent. The article describes per-agent budgets that avoid approving individual transactions as future work. These are vendor product and availability claims; the article's purchase-growth figure is not an independent reliability benchmark. [Stripe announcement](https://stripe.com/blog/helping-personal-agents-shop-more-intelligently-and-reliably-with-link)

### Sierra announcement: October 6, 2026

Sierra describes PAP as an open standard under development with Meta and partners. The user chooses delegated access; the business controls permitted interactions. Discovery begins at a company website, followed by an OAuth-based session that can cover web pages, APIs, and company agents. Guests can perform suitable public tasks; account access requires sign-in. The article announces a forthcoming v0.1 specification and reference implementation. Its speed and trust benefits are aspirations, not measured guarantees. The availability statement must now be read alongside the published draft below. [Sierra announcement](https://sierra.ai/blog/introducing-personal-agent-protocol)

### Link's current integration documentation

- **Product boundary and availability.** Link provides a separate API and customer OAuth tokens; ordinary Stripe secret keys do not authenticate it. The TypeScript SDK covers resources, while the hosted application owns authentication and credential storage. Payments are documented for US and Canadian customers; financial insights for US customers. [Link Agent Wallet](https://docs.stripe.com/agentic-commerce/agents/link-agent-wallet)
- **Hosted authorization.** The documented hosted flow requires a confidential OAuth client obtained through an application form, registered redirect URIs, server-held credentials, and checking the scopes actually granted. Refresh tokens rotate. [Authorization guide](https://docs.stripe.com/agentic-commerce/agents/link-agent-wallet/oauth)
- **Purchase flow.** A customer-approved spend request produces a payment credential. Raising its amount requires approval again; creation retries can use an idempotency key. Error handling distinguishes resuming an existing request from creating another. The guide recommends WebMCP for supported Stripe checkouts, but its concrete Link Pay Token walkthrough uses a DOM steering field and form submission. That walkthrough alone does not verify native WebMCP tool registration. A test mode is documented. [Spending guide](https://docs.stripe.com/agentic-commerce/agents/link-agent-wallet/use-link-wallet-pay-online)
- **Financial access.** Reading connected external-account data requires Financial Connections data-recipient registration and customer-granted actions. Link-transaction access has a narrower registration exception. [Financial insights](https://docs.stripe.com/financial-connections/agents/financial-insights)

### PAP's current draft and exact roles

The public site now serves **Draft 0.1**. Its parties are User, Personal Agent, and Company; a Company Agent is one offered interaction channel. Discovery uses the company's `/.well-known/poppy.json`. Sessions connect activity across channels. The draft distinguishes short-lived Session Tokens and account-access refresh tokens; account scopes include independent `poppy:read` and `poppy:write`, with company-defined scopes possible. Companies may require agent registration. APIs can expose OpenAPI or remote MCP. The optional browser-session mechanism explicitly requires an **agent-controlled browser, never the user's own browser**, for posting the browser assertion. [Current specification](https://personalagentprotocol.org/docs/spec)

The draft permits breaking revisions before 1.0. Payments, unsolicited push notifications, and attachments remain open topics. Public documentation is therefore not proof of a stable implementation or universal partner access. The official repository describes itself as the documentation site, not an implementation of the specified APIs. [Path to 1.0](https://personalagentprotocol.org/docs/path-to-1), [official repository](https://github.com/personal-agent-protocol/personal-agent-protocol)

### PAP Operations: substantial existing overlap

The optional **Operations extension v1** defines company-proposed operation IDs and immutable revisions, approval of exact terms, confirmation, and result tracking. It permits an applicable standing permission unless fresh user approval is required. The company must enforce at-most-once execution for that operation; uncertain effects remain `in_progress`. Failed or cancelled results can include partial changes. Confirmation proves the agent asserted approval, not that the person actually saw and accepted the terms. Confirmed work can continue after sign-out. These are protocol requirements and trust boundaries, not evidence that every implementation obeys them. [Operations extension](https://personalagentprotocol.org/docs/extensions/operations)

### Reproducible PAP references

The mutable public draft was checked against official repository commit **`95fcbf22c5991a0090061aed3dbeb68c0ea575e0`**, dated October 17, 2026 UTC:

- [Specification snapshot](https://github.com/personal-agent-protocol/personal-agent-protocol/blob/95fcbf22c5991a0090061aed3dbeb68c0ea575e0/content/spec.mdx)
- [Browser restriction, source lines 971–972](https://github.com/personal-agent-protocol/personal-agent-protocol/blob/95fcbf22c5991a0090061aed3dbeb68c0ea575e0/content/spec.mdx#L971)
- [Operations snapshot](https://github.com/personal-agent-protocol/personal-agent-protocol/blob/95fcbf22c5991a0090061aed3dbeb68c0ea575e0/content/operations.mdx)
- [Roadmap snapshot](https://github.com/personal-agent-protocol/personal-agent-protocol/blob/95fcbf22c5991a0090061aed3dbeb68c0ea575e0/content/path-to-1.mdx)

The date and commit identify what we read. They do not establish a stable release or conformance certification.

## 2. What this changes in our design

This section is our architectural interpretation. The runtime remains a proposal.

| Responsibility | Proposed owner | Boundary to preserve |
| --- | --- | --- |
| User objective, scoped facts, locks, mission dependencies | Our runtime in Convex | Merchant messages cannot rewrite user authority |
| Cross-mission reservations and commitments | Our transactional resource coordinator | An external approval or account balance does not itself allocate our shared mission budget |
| Interpreting goals and proposing repairs | Model API behind typed interfaces | Proposals must pass current-state checks |
| Company discovery and delegated account access | PAP adapter where implemented | Provider scopes are intersected with our mission grant |
| Payment credential and payment-specific customer flow | Link adapter where available | Payment access is separate from merchant account access and task completion |
| Page-tool invocation | Our active browser executor | Only accessible, tested page contracts; no arbitrary-tab assumption |
| Merchant order and fulfillment facts | Merchant/domain backend | A local state write cannot establish an external order |
| Completion evidence and unresolved cases | Our outcome reconciler | Payment, order, and delivery are distinct facts |

PAP, WebMCP, and Link are therefore neither interchangeable nor automatically integrated. Our existing WebMCP path supplies a browser execution surface; a company session and a wallet grant introduce separate identities and permissions. A server-only company API route can avoid a browser when the task genuinely does not require one.

**Novelty correction:** operation IDs, revision-bound approval, and timeout recovery already appear in PAP Operations. We should implement or reuse those contracts rather than present them as a new invention. Our testable hypothesis concerns useful mission behavior above that layer: preserve valid work, re-evaluate the right dependencies, coordinate shared obligations, and repair changing goals with less waste at comparable correctness.

That hypothesis can fail. If a competent same-model replanning baseline achieves equivalent outcomes and cost, an incremental runtime may not justify its extra machinery.

### Proposed identity and evidence mapping

Use separate namespaces instead of forcing unrelated identifiers to coincide:

```text
missionId + decisionRevision
  -> local operationId + argumentDigest + grantRef + reservationRef
  -> providerBinding { company, accountRef, providerOperationRef, termsRevision }
  -> paymentBinding { provider, spendRequestRef, approvedAmount, currency }
  -> outcomeEvidence { source, observedAt, paymentRef?, orderRef?, fulfillmentRef? }
```

This is our application contract, not a PAP or Link schema. A model receives safe references and state summaries, not OAuth secrets or payment credentials. Backend code owns token exchange and refresh. Store credentials through a restricted secret path; expose only nonsecret bindings to normal reactive queries.

A protocol confirmation and a payment attempt must be admitted against the same current mission intent, but they cannot be made one distributed transaction by adding a Convex mutation. Record each transition and reconcile uncertain external effects. Preserve the new requested budget even when existing obligations make it infeasible.

## 3. Three integration variations

### A. Controlled WebMCP application, with Link as an optional payment adapter

**Recommended first path.** Keep the current React workspace, Convex controller, and one browser executor. Expose a narrow controlled store contract. Introduce the wallet adapter behind the existing operation record only after its test flow is available. Bind the payment reference to the intended order, and verify the domain result separately.

**Advantages:** preserves the current architecture and makes selective repair visible; the team controls inventory changes, failures, and authoritative order observations. The wallet can be tested independently from mission planning.

**Costs and limits:** payment credentials do not solve browser compatibility, merchant authorization, or order verification. The checkout adapter must distinguish a native WebMCP call from a DOM-based integration. A demo that uses our own store remains a controlled-store demonstration.

**Access gate:** confirm hosted client registration, usable customer/test identity, a supported checkout, credential handling, and the actual native browser round trip. Until then, use a clearly labeled wallet fixture and make no live-payment claim.

**Decisive experiment:** two missions share a budget; tax changes on one order while the other is executing. Interrupt the reply after an external effect. Compare incremental repair and full replanning with identical approval requirements and provider behavior. Check preserved obligations, correct totals, duplicate effects, recovery latency, and unnecessary replacement work.

### B. PAP adapter to a cooperating company, initially API-only

Implement one company integration against the pinned draft. Our controller translates a typed mission action into the company's protocol operation and tracks the provider's record. Keep the mission graph, resource ledger, and repair logic unchanged. Avoid adding a second conversational agent when an API contract can express the task.

**Advantages:** explicit company participation and account authority; useful route to post-purchase changes and support tasks. It provides a serious interoperability target rather than a collection of unrelated website scripts.

**Costs and limits:** identity, keys, sessions, authentication, scope mapping, and recovery need implementation and testing. Company access is a separate dependency. If we later add the PAP browser route, provision a distinct agent browser context rather than repurposing the user's active workspace session.

**Access gate:** one confirmed cooperating endpoint or our own company implementation; pinned draft snapshot; authentication tests; an operation with machine-checkable business terms. A local company fixture is useful for development but must be labeled. A few compatible-looking JSON objects do not establish protocol conformance.

**Decisive experiment:** the company revises terms while our plan is stale; the user changes a constraint; then a confirmed operation loses its response. Evaluate correct acceptance/rejection, recovery of the original effect, and continued progress on unrelated mission branches. Separate bugs in our planning policy from violations in the company implementation.

### C. Capability-based routing across company API and browser commerce

Add a deterministic adapter selector that prefers a tested structured route, with the browser available for tasks requiring page context. Keep wallet usage independent of transport. Persist which adapter owns each attempted effect and its external references.

**Advantages:** can cover tasks spanning shopping and after-sales work without making one protocol universal. The model can choose an information-gathering action while deterministic code enforces the execution boundary.

**Costs and limits:** cross-channel identity and duplicate-effect risks increase. A timeout is not permission to start a new purchase through another route. An alternate channel may inspect the same operation only when its contract supports that mapping; otherwise the runtime must wait or ask.

**Access gate:** both individual routes already work and a cross-channel identity mapping is tested. Do not make this the first end-to-end milestone.

**Decisive experiment:** interrupt a transaction, switch the available channel, and verify that recovery preserves one logical business effect. Contrast safe status lookup with an intentionally naive fallback policy. Include cases with no valid cross-channel mapping, where the correct result is an explicit unresolved state.

## 4. Minimum evaluation and access discipline

Freeze the test set only after the adapter contracts and failure oracle are stable. Give ReAct, structured global replanning, and incremental repair the same model, observations, tools, domain guards, grants, approvals, and total resources. Do not give our runtime private protocol state while the baseline sees screenshots alone.

Separate three results:

1. **Adapter conformance:** the authentication, revision, and recovery contract behaves as tested.
2. **Runtime correctness:** our mission ledger and commitments remain consistent with authoritative outcomes.
3. **Agent usefulness:** the decision strategy improves completion, latency, intervention burden, or cost.

A provider preventing a duplicate should be credited to the provider contract. Our added value must survive comparison with a baseline using that same prevention. Likewise, model calls saved by deterministic transitions should be counted together with all lookup, validation, and reconciliation work.

The smallest useful experiment is one controlled merchant, two concurrent missions, one shared budget, and a small frozen matrix covering unchanged state, relevant/irrelevant changes, altered terms, authority loss, lost replies, and partial outcomes. Use an independently implemented oracle over actual merchant records. Report all failure cases, including abstention and manual intervention; do not promise an improvement before running it.

**Current access status:** public HTML documentation and the PAP repository were readable. The documentation site's Markdown endpoints failed in the browsing tool, so HTML plus pinned source files were used. No OAuth application was submitted, no partner endpoint was exercised, and no third-party reference implementation was audited. These remain implementation gates, not reasons to represent a fixture as a live integration.

Before implementation, recheck the mutable Link guides and compare PAP against the pinned snapshot. The useful deliverable is a working, honestly scoped adapter plus measured mission behavior—not a claim that the announcements already provide the complete personal-agent system.
