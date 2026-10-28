# Editorial review: reader-value gate

Read the proposed piece and check **all** gates below. Evaluate its *actual
sentences*, not the writer's stated intention.

## Reader test

- Without project history, can a reader say in two sentences what matters and
  why this is worth time? If not, point to the earliest missing context.
- Do title, first two paragraphs and conclusion communicate one compatible
  promise? Identify promise drift.
- Does every large technical section buy an insight, decision or example?
  Mark internal details that belong behind a source link or in an appendix.

## Author and evidence test

- Which specific claim or judgement gives this author a distinct point of
  view? If none is supplied, request it rather than writing a generic opinion.
- Are source-backed observations separate from hypotheses and opinions?
  Check dates, primary links and the exact limits of tests/results.
- If the text says "I found / I tried / users saw / production failed",
  verify the source proves that exact claim. A code fix does not prove a
  user-facing incident; a local regression test does not prove live behavior.
- No private strategy, manuscript, employer secrets or unsupported impact
  claims enter public material.

## Form and voice test

- Could the text be mistaken for a changelog, internal ADR or API manual?
  If yes, extract the human-interest or reusable engineering question and
  recommend a different opening/ordering. Keep traceability for technical
  readers.
- Is it clear without sacrificing precision? Expand essential jargon once,
  remove needless repetitions and avoid invented drama or generic slogans.
- For RU/EN, check claim-level equivalence and natural language in both.

## Pilot calibration: K39 agent-editing article

An accurate description of draft/editor scopes, pending changes and test
commands is *not itself* a reader payoff. A stronger angle could ask:

"How can an AI assistant prepare changes to a live site without silently
publishing them?"

The opening should explain the risk and the broader design problem, using a
**hypothetical** example unless a real incident is independently verified.
The code, historical bug and tests then become evidence for the insight.
Do not claim production customers experienced the bug without proof.

## Verdict

- **Ready:** reader promise is earned; facts and publication boundaries are
  checked; any remaining edits are nonblocking.
- **Revise:** a valuable piece exists but opening, structure, argument,
  voice or evidence needs named changes.
- **Insufficient basis:** no meaningful reader payoff or missing primary
  evidence / author input would require invention.

Do not use numeric ratings. Identify up to three decisive changes, not a
generic 20-point critique. Suggest a concrete revised opening only if it
demonstrates the fix; leave the owner the final authorial choice.
