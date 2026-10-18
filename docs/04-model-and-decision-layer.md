# Model Calls and the Decision Layer

## Recommendation

Use a model API as a core component. Start with one provider/model configuration behind a small interface. Gemini is a reasonable sponsor-aligned candidate, but the exact model and version should be selected through development-set measurements and then pinned for evaluation.

Define separate interfaces for interpretation, planning, next-action decisions, and repair. These are logical roles, not a requirement for four model services, four autonomous agents, or four independently trained sets of weights.

Use deterministic routing for unambiguous state transitions. Invoke a model when meaning, preferences, information gathering, or unresolved alternatives require judgment. A dedicated learned decision model is a later experiment, not an assumed requirement.

## Role boundaries

| Role | Input | Output | Cannot do |
|---|---|---|---|
| Interpreter | User message and relevant existing context | Candidate scoped fact/mission patch, ambiguities, source references | Convert inferred preference into authorization |
| Planner | Resolved context, tools, resources, objective | Typed candidate decision graph and alternatives | Directly mutate orders or declare its own effect contracts |
| Decision policy | Current observation, event delta, valid candidates, missing information | Next action category and target | Override grants, reservations, stale-state checks, or hard constraints |
| Repair planner | Invalid portion, preserved boundary, new facts, constraint failures | Candidate patch or explicit unresolved conflict | Delete completed effects to make a plan appear valid |
| Deterministic verifier | Candidate/current state and formal domain rules | Valid/invalid with concrete failing conditions | Infer arbitrary real-world facts absent from the model |

The executor performs a selected action. The verifier checks observed results. Neither should be implemented as “ask the same model if its answer was correct” for conditions that can be checked directly.

## What the decision model decides

The decision layer chooses the next useful action under partial information. It may choose to execute a ready step, acquire information, repair a subplan, escalate to a full plan, ask the user, wait, or stop.

This is an explicit policy interface. LLM-based reasoning and acting is established practice, including [ReAct](https://arxiv.org/abs/2210.03629); adding a policy prompt alone is not the project's technical novelty.

### Canonical action vocabulary

| Action | Meaning | Example prerequisite |
|---|---|---|
| `continue` | Advance a ready action or bounded batch of independent actions | Dependencies valid; authority and resource checks pass |
| `query` | Obtain a useful missing observation | A registered read tool can address the information gap |
| `repair` | Recompute an affected subset | A relevant condition failed or a meaningful choice became outdated |
| `replan` | Reconsider the remaining mission more broadly | Local expansion is insufficient or the objective materially changed |
| `ask` | Request information or authority only the user can supply | The missing answer can change what is permissible or appropriate |
| `wait` | Await a known external condition | Operation outcome, executor availability, or scheduled event is pending |
| `stop` | Finish or terminate with an evidence-backed reason | Completion verified, cancellation accepted, or bounded failure established |

Earlier discussion used labels such as EXECUTE/OBSERVE/ASK_USER; these map to continue/query/ask here. Action names are interface choices, not distinct model capabilities.

### Decision input

Pass a compact, explicit snapshot:

- Mission objective and applicable personal context, with sources.
- Hard constraints, soft preferences, fixed choices, and current authority.
- Recent event delta and relevant dependency evidence.
- Ready, invalid, executing, unknown, and completed operations.
- Remaining budget, reservations, deadline, and model/tool budget.
- Legitimate candidate actions and known information gaps.
- Prior failed approaches and bounded retry/repair history.

Do not provide future injections, oracle solutions, hidden fixture IDs that encode answers, or the complete true dependency graph from the benchmark. The policy operates on observations, not omniscient world state.

### Structured output sketch

```json
{
  "action": "query",
  "targetIds": ["delivery-observation:item-A"],
  "toolRef": "merchant-A:estimateDelivery@contract-2",
  "arguments": {"itemId": "item-A", "destinationRef": "user-approved-region"},
  "evidenceRefs": ["deadline:friday@3", "item-A:offer@8"],
  "reasonCode": "missing_delivery_evidence",
  "explanation": "The lower-cost option has no confirmed arrival date.",
  "requiredChecks": ["tool_available", "read_authorized"]
}
```

This is a format example, not an observed model response. The runtime verifies references, candidate membership, arguments, and required conditions independently. The explanation is a short decision summary, not a substitute for evidence or a request for hidden chain-of-thought.

## Example of useful model judgment

The user needs an item by Friday. Product A is less expensive but has an unknown delivery date. Product B is more expensive and has an acceptable confirmed delivery date. Both fit the spending cap.

The policy can query A's delivery date if the information is inexpensive and likely to affect the choice. If the user explicitly prioritizes quick completion and B satisfies all requirements, selecting B may also be legitimate. If neither has verifiable delivery, the policy should not invent certainty.

There may be multiple good next actions. Evaluation should measure permitted behavior and downstream outcomes, not demand exact agreement with a single handwritten choice.

## Deterministic routing and model routing

The basic controller handles clearly determined cases without asking a model:

| Condition | Controller behavior |
|---|---|
| Completed operation receipt arrives | Record the effect, settle resources, update dependent state |
| Write outcome is unknown | Reconcile through an outcome query; do not blindly repeat |
| Browser executor is unavailable | Persist waiting state |
| Authorization is absent or revoked | Prevent the new effect; identify the required user decision |
| Unrelated fact changes | Update context without mandatory replanning |
| Hard arithmetic constraint fails | Return a concrete violation to repair logic |

Model routing is useful when choices remain after these rules: whether to acquire more information, which permissible branch to pursue, how to interpret an exception, or which alternative best fits soft preferences.

This hybrid approach is compatible with the distinction between routing workflows and autonomous action selection in [Anthropic's architecture guidance](https://www.anthropic.com/engineering/building-effective-agents). It is our proposed design, not a claim that a particular prompt is proven superior.

## Model-to-browser bridge

Function calling returns a requested function and arguments. The application must execute that request, capture the result, and continue the interaction. A model provider does not automatically operate the user's browser. See [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling).

The bridge must:

1. Discover tools in an authorized browser context.
2. Normalize supported tool metadata into the model interface without name collisions.
3. Associate each request with mission, decision, operation, and adapter identities.
4. Validate the requested operation before creating a command.
5. Let the browser invoke the current tool handle.
6. Record the outcome, including unknown results, and expose it to the controller.

Navigation, schema changes, or disconnected executors can invalidate a tool binding. Re-discover and validate rather than silently calling a different tool with the same name. See [deployment](05-deployment-and-operations.md).

## Context and memory policy

The context resolver belongs to application code, not to an unbounded conversational memory feature. It selects facts by owner, subject, scope, validity, and relevance; it includes unresolved conflicts explicitly.

Messages can help interpret intent, but the resolved mission state should remain authoritative. Do not require the model to reconstruct the current budget or authorization from a long conversation every time.

If retrieval is added later, it proposes candidate evidence. It does not grant authority or override structured scope rules. Tool-returned web content is data and cannot redefine the user's policy or the system's action permissions.

## Model configuration and costs

For each experiment, pin provider, model/version, sampling and reasoning settings, prompt version, tool schema, maximum output size, and total call budget. Record provider-reported input/output usage and all auxiliary calls, including classification, routing, retries, and verification models if used.

API transport retries and semantic repair are different. A repeat model request may generate a different proposal; it must still pass publication validation. Retrying a model call never authorizes replaying an uncertain external write.

Initially, all primary evaluation strategies use the same model configuration. A small routing model plus a larger planning model is a separate cost-quality experiment, not a fair replacement inside only one headline comparison without disclosure.

## When to train a dedicated decision model

Consider specialization only after we have a reliable environment, trustworthy traces, an independent evaluator, and evidence that decision calls dominate cost or latency.

A staged investigation could be:

1. Deterministic router plus existing planner.
2. Same-model structured decision policy, with measured additional calls.
3. Smaller policy model evaluated against the same observations and budget accounting.
4. Supervised distillation from vetted development trajectories.
5. Policy learning in the controlled environment, if it adds measurable value.

Do not train on held-out benchmark traces and continue calling them held-out. Offline replay can test some decision classifications, but it cannot establish the downstream result of an unexecuted alternative without a valid environment model or new rollout.

A policy objective may balance task utility, time, calls, and unnecessary changes. Hard authorization and validity conditions stay outside that tradeoff: an invalid purchase does not become acceptable because it saves tokens.

## Evidence required to retain the decision model

Compare deterministic routing and model-assisted routing with the same planner, tools, state, guards, and tasks. Count downstream success, unnecessary questions, missed repair, repair scope, cost, and latency. If routing adds calls without improving any justified outcome, keep the simpler router.

This experiment is described as D0 versus D1 in [06](06-evaluation-and-experiments.md). There are no decision-model results yet.
