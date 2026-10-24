export const PROCEDURES = [
  {
    id: 'guest-bus-amendment', version: '1.0.0', title: 'Amend an existing guest bus reservation', reviewedAt: '2026-10-22',
    applicability: 'Controlled transport provider; existing guest booking; available booking-scoped guest management capability. A member booking needs the member procedure and cannot use guest access.',
    sources: [{ url: 'https://www.limousinebus.co.jp/en/support/', title: 'Airport Limousine — official support FAQ', retrievedAt: '2026-10-22', rule: 'Guest and member bookings have separate management paths. Changes use a five-minute-before-departure cutoff; after-midnight departure uses the following calendar date.' }],
    fixtureBoundary: 'Operator rule semantics inform this curated procedure. Inventory, API, payment and all booking identities belong to our test provider; there is no commercial integration.',
    preconditions: ['Verify guest capability and original booking channel', 'Verify current booking, quote and inventory revisions', 'Ready-at-stop upper bound plus 10 minutes fits departure', 'Hotel arrival fits accepted bound, or explicitly authorized provisional bound', 'Additional fare and all active holds fit the current grant', 'Start dispatch at least 30 seconds before provider cutoff'],
    actions: ['Read booking and inventory', 'Obtain hotel acceptance or explicit pending policy', 'Refresh quote', 'Prepare immutable operation and cost hold', 'Amend the same booking', 'Read operation receipt and booking'],
    failureBranches: ['Missing guest access: request correct capability', 'Unknown result: reconcile same operation; retain hold', 'Changed inventory or expired cutoff: refresh and report infeasible alternatives', 'Changed intent or grant: deny new effect'],
    postconditions: ['One valid reservation under the same booking ID', 'Provider receipt states exact additional charge and revision', 'Original hotel night is preserved'],
  },
  {
    id: 'hotel-late-arrival', version: '1.0.0', title: 'Obtain explicit late-arrival acceptance', reviewedAt: '2026-10-22',
    applicability: 'Controlled hotel provider; existing hotel booking and booking-scoped hotel capability.',
    sources: [{ url: 'fixture://tokyo-arrival-v1/hotel-policy', title: 'Controlled hotel policy fixture', retrievedAt: '2026-10-22', rule: 'Default latest arrival is 01:00 on the next date. Requests until 03:00 are free and can be accepted, pending or declined. This is synthetic property-specific policy.' }],
    fixtureBoundary: 'The hotel rule is an explicit test policy, not a statement about hotels in Tokyo generally.',
    preconditions: ['Read original service night and checkout', 'Verify current hotel access and grant', 'Request a definite latest arrival time'],
    actions: ['Submit late-arrival request for existing booking', 'Persist the provider submission outcome', 'Read the provider business decision', 'Keep pending distinct from accepted'],
    failureBranches: ['Pending: wait or seek bounded transport tradeoff', 'Declined: preserve existing commitments and request a decision', 'Unknown: reconcile the original operation'],
    postconditions: ['Original service night and checkout remain unchanged', 'Only explicit provider acceptance establishes an accepted arrival bound'],
  },
] as const;
