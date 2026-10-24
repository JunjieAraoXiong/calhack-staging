# Cal Hacks 13.0 plan (final, Oct 23)

Submission deadline: **Sun Oct 25, 8:50 AM PT** (event schedule; Devpost says 9:00). We submit by 8:15. Judging starts 10:30 AM.

## The decision

We build an **autonomous accounts payable (AP) team for a live-events company**: two seats, the AP specialist and the payments coordinator, working under a human controller.

It does the job end to end:
- learns each vendor's web portal without an integration
- pulls the bills
- checks every bill against contracts, amendments, deliveries and attendance
- pays what's right, holds what's wrong, and asks the controller only when it should
- when a fact changes months later, re-checks every payment that depended on it

The shopping/camping version is dropped. Three things published today drove this, not a change of taste:

1. **Hyphenate's track pays $8k / $5k / $3k (three winners) plus interviews.** Its four judging questions describe our design:
   - "limited access, a clean record of its work, and knowing when to ask"
   - "catches what others missed, recovers from something going wrong, or defends a decision when questioned"
   - proof through "planted errors with an answer key"
2. **Microsoft's grand prize asks for a "production-minded AI agent" in finance**, among other domains. **Convex is now $5,000 cash.** **Factory's rubric matches our tool-repair loop line for line.** One build enters all four.
3. **Visa's starter pack says "Visa will not be providing proprietary Visa APIs."** It is one $5k prize, judged as consumer shopping. Shopping agents have won sponsor tracks but no top-overall prizes at recent big hackathons.

This keeps more of our earlier work than shopping did. See "What we kept" below.

## One line on the seats (Hyphenate asks for this)

> Fills the AP specialist and payments coordinator seats at a 20,000-person music festival; the controller keeps sign-off.

## What is actually new (and what isn't)

These three pieces are ours. Everything else we credit.

| Piece | What it does | Closest existing work | What we add |
|---|---|---|---|
| **1. Decisions that recheck themselves when facts change** | Every pay or hold decision records the exact facts it used (contract term v3, May amendment, scanned attendance, vendor bank account v2). When a fact changes, only the decisions that used it are invalidated, and their payments are blocked until rechecked or re-approved. | Truth-maintenance systems (1979); PlanFence (checks a plan's inputs before acting) | Applied to money-moving AP decisions over months, with a "why" trace back to the source document |
| **2. Portal tools with accounting contracts, repaired surgically** | The agent writes WebMCP tools for vendor portals with no API. Each tool has a contract checked on every call with no LLM (e.g., the downloaded invoice's total and number match the portal's row). When a contract fails, only that tool is repaired, re-verified and versioned. | Unbrowse, Browser Use Scripts, Skyvern, Browserbase `webmcp-gen`, DeepDeck; papers: WALT, SkillWeaver, "Skill Drift Is Contract Violation" | Contracts tied to accounting truth; tool version history inside the audit trail; repair by a scoped Factory Droid |
| **3. Calibrated "knowing when to ask"** | Every bill gets act / ask / hold with a calibrated probability. Thresholds depend on risk (amount, new vendor, changed bank details). Measured on an answer key. | KnowNo (conformal prediction for asking humans), ReDAct, StepGate, TypeSafe's Jev | A calibrated policy for AP exceptions, with a reliability diagram and a guaranteed cap on wrongful auto-approvals |

Already solved, so we do not pitch these as new:
- fetching bills from big vendors' portals (Hubdoc, Dext, GetMyInvoices; "Tieout" got only a $100 credit at Hyphenate's own September hackathon for an AP portal agent)
- learn-once/replay browser automation
- email/OCR invoice capture
- duplicate detection alone (Reckon won that hackathon with it)

**Lesson from Hyphenate's last hackathon:** measured proof won, not the idea.

## The company we simulate ("Fog City Fest", fictional)

Hyphenate asks teams to "build the company it works in: the software it uses, the people it answers to, and the mistakes hiding in its data."

- **A 3-day, 20,000-person festival in SF.** About 40 vendors: stage, sound, security, sanitation, catering, fencing, artists.
- **Season runs March → August**, compressed by a season clock. Deposits are paid in March, amendments signed in May, final bills arrive in August.
- **Per-head contracts.** Security, sanitation and catering are priced per attendee with minimums. This is where "what happened in March should change June" bites.
- **Software in the company's world:**
  - 4 vendor portals with different UIs, each with internal JSON APIs, a login, invoice lists, PDFs, statements and a "change remittance details" page. Each has a "v2 redesign" switch.
  - Email inbox (invoices, amendments, a bank-change request).
  - Ticketing platform (scanned attendance).
  - Bank (Capital One Nessie).
  - Double-entry ledger, POs and receipts (in Convex).
- **People:** controller (a human in the live demo; a Claude persona in eval), ops manager (confirms deliveries), vendor AR reps (personas).
- **Planted mistakes:** POs a colleague never updated after an amendment, deposits not netted, duplicates sent through both portal and email, short deliveries, credit memos not applied, a bank-details change the day before a large payment, plus legitimate look-alike decoys.

## How it works

```
Controller console (Next.js): approvals digest, audit trail, "why?" chat, chaos panel, season clock
        |
Convex (system of record + agent runtime)
  - company data: vendors, contracts (structured terms), POs, receipts, bills, payments, ledger
  - facts (versioned, effective dates) + decisions (depends_on fact versions) + reverse index
  - seats/principals + permissions; segregation of duties enforced in mutations
  - Workflow: durable daily runs per seat; scheduled season clock
  - append-only audit log: every tool call, fact used, decision, approval, tool version
        |
Agent worker (Node)
  - Claude: reads contracts/PDFs, handles ambiguous matches, writes tools, explains decisions
  - decision policy: deterministic checks (math, matching, policy) + calibrated act/ask/hold
  - browser: Playwright Chromium + WebMCP polyfill (@mcp-b/global); learned tools registered per portal
  - tool writer: DOM + network capture -> tool manifest (webmcp-gen-style) + contract -> verify -> store
  - tool repair: contract fails -> Factory Droid session scoped to that tool -> patch -> re-verify -> new version
        |
External sandboxes: CRS (vendor OFAC / business / identity checks), Nessie (bank: payments + feed)
```

**Rules the backend enforces:**
- The seat that requests a payment can't approve it.
- Auto-approval only below materiality, with a full match and no invalidated facts.
- Bank-detail changes always go through CRS checks, a callback task and the controller.
- The agent never sees portal passwords (a vault injects the session; this is the production path).

## The moment (the video opens with this)

> August: the security vendor bills for 20,000 attendees. In May the festival signed an amendment cutting capacity to 15,000 and billing on scanned attendance (minimum 12,000). Nobody updated the PO, so a standard 3-way match passes the bill. Our agent holds it. The decision depended on the attendance fact, which changed in May. It shows the amendment clause, the scanned count (14,212), the correct amount and a drafted dispute for the controller.

This works because of piece 1. It covers "catches what others missed", "sources that disagree" and "time" in one shot.

## Demo (3 minutes)

| Time | What happens | Covers |
|---|---|---|
| 0:00–0:20 | The moment above, with the trace on screen | Catches what others missed |
| 0:20–0:35 | Who it's for and the seats line | Would you hire it |
| 0:35–1:10 | Morning run, live. The agent logs into a portal it hasn't seen, writes 3 tools with contracts, pulls new bills. Routine ones go through within limits; exceptions land in the controller's digest. | Limited access, knowing when to ask |
| 1:10–1:40 | **Judge's choice from the chaos panel:** redesign a portal (one tool fails its contract, Droid repairs only it, diff shown), or change a vendor's bank details (CRS check, hold, callback, ask) | Recovers from something going wrong |
| 1:40–2:10 | A credit memo or capacity change arrives. Only the dependent decisions turn red; their payments are blocked; everything else stays. | Time, explainability |
| 2:10–2:35 | Judge asks "why did you hold this?" and gets a cited answer. The agent can't approve its own request; the audit trail shows it. | Defends a decision, clean record |
| 2:35–3:00 | Proof: season replay numbers vs baselines (real runs only) | Proof it works |

Hyphenate says judges may give their own scenario. The chaos panel and the eval use the same event injectors, so anything a judge injects has been tested.

## Proof (JJ owns)

- **Season generator:** about 40 vendors and 400 bills over 6 months. About 10 error types (about 40 planted errors) plus about 60 legitimate decoys. The answer key is kept outside the agent.
- **Baselines on the same data and tools:**
  - rules-only 3-way match
  - a plain Claude agent with the same tools but no fact tracking and no calibration
- **Metrics:**
  - errors caught (recall)
  - false alarms (precision)
  - wrongful auto-approvals in dollars and count (target 0)
  - asks per 100 bills
  - dollars protected
  - cost and seconds per bill
  - stale decisions left after fact changes
  - tool repair success and cost vs relearning
- **Calibration:** reliability diagram for act/ask/hold; held-out seasons; conformal threshold capping wrongful auto-approvals.
- **Optional external benchmark:** a subset of FinBalance (arXiv 2606.15949, inconsistency detection) if time allows.
- **Every number shown comes from real runs.** The list of what's simulated goes on the Devpost page.

## Tracks

| Track | Prize | What their judges want | What we show | Owner |
|---|---|---|---|---|
| **Hyphenate**, Autonomous Systems for Finance | $8k / $5k / $3k + interviews | Real enough; would you hire it; something new; the moment | Everything above | JJ (proof), all |
| **Microsoft**, Built for the Real World | Surface laptops + FDE tech talk + mentorship | Customer understanding, measurable usefulness, path to production, responsible design, end to end | Customer interview notes; cost per bill; production path (vault, permissions, tool health, rollback); thresholds | Arav's friend |
| **Convex** | $5,000 | "The reactive backend that keeps up with you and your agents" | All state, durable Workflow runs, scheduled season clock, transactional segregation of duties, dependency index, live console | Arav |
| **Factory**, Droid SDK | $2,000 | Droid doing real work in the product, on a trigger we designed, scoped, with visible diffs | A failed tool contract triggers a Droid session limited to that tool's folder; the diff and re-verification are shown; README section | Srivatsav |
| **CRS** | $1,000 / $500 / interviews | CRS central, live against the sandbox, useful | Vendor onboarding and bank-change checks (OFAC, business credit, identity) feed the hold decision | Arav |
| **Capital One Nessie** | $300 per person | Completeness, creativity, complexity | Nessie is the company bank: payments go out through it, and its feed is reconciled to the ledger | Arav |
| Cal Hacks overall / Most Technically Complex | various | Overall criteria | Same project | all |

Not targeting: Visa (no APIs, consumer shopping), Creao (must build on CREAO), Moss / Apify / Bright Data (personal agent, or no scraping behind logins), Coinbase (every member needs a verified US/Canada account), Fetch.ai (second front end), Atlassian (Forge app), Meta, Spacetime (we picked Convex), Anthropic (its "named community" doesn't fit; revisit if their prize details change).

**CRS and Nessie are add-ons.** We cut them first if behind (see the cut order).

## What we kept from our earlier ideas

| Earlier idea | Where it lives now |
|---|---|
| Self-writing WebMCP tools (yours) | Portal tools with accounting contracts + surgical repair |
| Memory that checks itself | Tool contracts checked every call; facts versioned with effective dates |
| JJ's mission repair (6 campers → 4) | Capacity 20k → 15k invalidates only the dependent payment decisions |
| JJ's runtime ADRs (state outside chat, reservations, receipts, reconcile before retry, grants) | AP controls: system of record, payment admission, idempotent payments, bank reconciliation, approval limits |
| Decision model / Jev (JJ) | Calibrated act/ask/hold policy measured on the answer key |
| Observability log (JJ) | Append-only audit trail + "why?" answers |
| 1Password-style secrets (JJ) | Credential vault; the agent never sees portal passwords |
| Eval with fault injection (JJ) | Planted-error seasons + chaos panel |

## Who does what

| Person | Owns |
|---|---|
| **Srivatsav** | Browser worker, WebMCP injection, tool writer, tool contracts, Droid repair loop, tool registry and versions |
| **JJ** | Season generator with planted errors and answer key, baselines, scorer, calibrated decision policy, persona simulators |
| **Arav** | Convex schema and runtime: company data, facts/decisions dependency graph and invalidation, permissions and segregation of duties, Workflow and season clock, CRS and Nessie |
| **Arav's friend** | Vendor portals (with v2 redesign), inbox, ticketing, controller console (digest, audit trail, why-chat, chaos panel), video and Devpost page |

Friday night everyone works against one shared Convex schema. Interface changes get agreed in the group chat first.

## Timeline

| When | Done means |
|---|---|
| Fri 6–7 PM | Plan agreed at dinner. Repo created. Convex project and schema v0. Srivatsav at the Factory workshop (Theater). |
| Fri 7–8 PM | Hyphenate workshop (JJ + Arav at least). Microsoft social (Arav's friend). |
| Fri 8 PM–2 AM | **Vertical slice:** one portal with a hand-written tool pulls one bill; Convex stores it; deterministic match vs PO and contract; the console shows the decision and its trace. |
| Sat 8 AM–1 PM | The tool writer generates tools and contracts for 4 portals. Facts/decisions invalidation works. Segregation of duties works. Season clock runs. Generator v1. Interview someone who pays event vendors (Microsoft's customer understanding). Microsoft workshop 10 AM. |
| Sat 1–6 PM | Droid repair on a v2 portal. CRS checks on a bank change. Nessie payments and reconciliation. Calibrated policy v1. Digest and why-chat. Chaos panel. Hyphenate mixer 2 PM (show progress). Convex workshop 4 PM. |
| Sat 6 PM–12 AM | Full-season eval vs baselines; fix what it finds; numbers and reliability diagram. |
| Sat overnight | Eval batch over several seeds, unattended. |
| Sun 12–6 AM | UI polish. Record the video (opens with the moment). Devpost page. |
| Sun 6–8:15 AM | Rehearse the 30-second and 3-minute versions twice. Submit by 8:15. |

**Cut order if behind:** Nessie (use our own bank table) → CRS → learned calibration (rules + Claude with fixed thresholds) → Droid (repair with Claude directly; loses Factory) → 4th portal → why-chat.

**Never cut:** the moment, the planted-error proof, tool learning on at least 2 portals with one live repair, fact invalidation, segregation of duties and the audit trail.

## Tonight's checklist

- [ ] Ask in #ask-directors or at the concierge whether one project can enter several sponsor tracks, and whether there's a cap.
- [ ] At the Hyphenate workshop, ask:
  - Is a festival's AP corner a good pick?
  - What scenario would you throw at us?
  - Is the bank-details-change fraud case overdone?
- [ ] At the Factory workshop, ask for credits, and confirm a Droid session can be limited to one folder.
- [ ] Get keys: Anthropic, Convex, CRS sandbox (calhacks.crscreditapi.com), Nessie, Factory.
- [ ] JJ creates the fresh repo; add everyone.

## Devpost and video checklist

- Video of 3 minutes or less that opens with the moment, and works on its own for sponsors judging asynchronously.
- Public repo, live link, architecture image.
- Numbers vs baselines, with sample sizes.
- A "what's real vs simulated" list.
- One section per sponsor showing exactly what their product does in ours (Factory requires this in the README).
- A paragraph on how we differ from Hubdoc, Unbrowse, Skyvern, AP suites and Reckon (the Creativity criterion asks for this).

## Sources

- Official criteria and starter packs: https://hive.hackberkeley.org/prizes and /resources (Hyphenate, Visa, Atlassian docs read Oct 23).
- Schedule: https://hive.hackberkeley.org/schedule.
- Devpost: https://cal-hacks-13-0.devpost.com/.
- Hyphenate background and their September hackathon: syndicate-by-maximor.devpost.com (Reckon, Tieout, Skeptic).
- Prior art: github.com/browser-use/workflow-use, docs.browser-use.com, github.com/browserbase/skills, arxiv.org/abs/2604.00694 (Unbrowse), arxiv.org/abs/2510.01524 (WALT), arxiv.org/abs/2504.07079 (SkillWeaver), arxiv.org/abs/2605.10990 (skill drift), arxiv.org/abs/2609.03340 (PlanFence), webmachinelearning.github.io/webmcp, docs.stripe.com/agentic-commerce/agents/webmcp.
- Factory SDK: docs.factory.com/sdk/typescript.md. CRS: calhacks.crscreditapi.com.
- FinBalance benchmark: arxiv.org/abs/2606.15949.
