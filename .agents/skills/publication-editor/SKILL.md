---
name: publication-editor
description: Editorial pitch, draft, rewrite, translation and review for kosarev.space public Writing publications: personal notes, AI/open-source digests, engineering articles and deep dives. Use before proposing or publishing an article, evaluating whether a technical report has reader value, or reviewing public editorial prose. Do not invoke for routine software changes or purely internal engineering documentation.
---

# Publication editor

**Editorial promise:** Give a reader who has never opened the underlying repository a reason to care, one defensible idea to take away, and a clear sense of what the author actually knows.

Use this skill for public editorial work on kosarev.space. Follow root AGENTS.md and docs/brand.md for factual, privacy, language and publication permissions. This skill is an editorial method, **not** permission to publish, invent facts, merge, or deploy.

## Choose the task

- **Pitch:** select or evaluate a topic before writing.
- **Draft / rewrite / translate:** create or improve an approved public material.
- **Review:** assess an existing draft or live article, even if technically accurate.

A note, digest and article are formats of **one Writing publication stream**. A product page answers "what exists?" and an engineering case answers "what did I deliver?". A Writing piece answers "what is worth understanding, questioning or trying?". Link between them when useful; avoid duplicating a case study as an article.

## 1. Establish the reader promise

Before drafting or rewriting, state privately or in a compact brief:

1. **Reader:** who should find this valuable, without knowing the project?
2. **Question:** what specific problem, surprise or curiosity drives the piece?
3. **Payoff:** what will the reader understand, reconsider or be able to try?
4. **Author's angle:** what can the author personally substantiate, observe or reasonably argue?
5. **Evidence:** primary links, code/tests or approved testimony; what is still unknown?
6. **Format:** note, digest or article; choose by purpose, not word count.

The title and opening must deliver on the same promise. If the payoff is only "here is how my repository is structured", reframe toward a transferable problem **or** treat the work as project documentation. If neither a worthwhile question nor adequate evidence exists, return a pitch/outline and missing inputs instead of a publishable draft.

**Completion:** an unfamiliar reader can paraphrase both the question and payoff from the title and opening, without knowing project-specific nouns.

## 2. Pitch

Suggest up to three distinct angles with: working title, reader, question, one-sentence payoff, evidence available, gaps, and what makes the author's perspective credible. Recommend one only when evidence supports it. Never turn a just-merged PR or interesting implementation detail into an automatic publication mandate.

**Completion:** each idea has a reason to exist for a reader; missing evidence and disclosure decisions are visible.

## 3. Draft or revise

- Open with a concrete question, observable tension or verified example. Give essential context before introducing tables, scopes, database names, acronyms, code or internal chronology.
- Build a **reader journey**: stakes -> what was tried or observed -> what the evidence actually establishes -> trade-offs -> useful takeaway. Rearrange or omit internal implementation details that do not advance that journey.
- Put reproducible commands and exhaustive technical references where motivated readers can find them; retain accurate links and limitations.
- Explain why details matter; use examples rather than unexplained jargon. Depth is welcome when it serves the payoff.
- Keep the author's actual perspective. Distinguish observation, inference, proposal and personal opinion. Never fabricate a production incident, quotation, emotion, metric, user response, employer fact or firsthand experiment to create drama.
- Preserve public-source provenance, release-versus-proposal distinctions and uncertainties. Cross-check current external claims and date them. A test result is not a production result.
- Use RU/EN when the publication brief calls for both; make versions equivalent in claims and meaning, not word-for-word translations. A single-language pilot needs owner approval.

Read [format guidance](references/formats.md) when deciding structure for a **note, digest or article**. No fixed essay template applies to every piece.

**Completion:** the opening earns attention; each section advances the promise; the ending offers an insight rather than a release-note recap; source claims remain defensible.

## 4. Review before publication

Read [editorial review](references/review.md), then assess as both an unfamiliar reader and a fact-checker. Perform this even when engineering tests, link checks and code review pass.

Return:
- **Verdict:** ready / revise / insufficient basis, with the decisive reason.
- **Reader promise:** what the current piece actually offers, and whether its opening makes that clear.
- **Top issues:** at most three ranked, each with an exact location, why the reader loses value, and an actionable edit.
- **Opening revision:** a short example when it would materially improve the piece; mark illustrative scenes as hypothetical and do not invent firsthand experience.
- **Evidence/approval gaps:** claims to check or author choices requiring owner approval.

For minor edits, report only what matters. For a bilingual publication review both languages. Keep technical accuracy, authorial voice and readability separate assessments.

**Completion:** verdict is supported by concrete text evidence; a revise verdict identifies specific edits; passing CI alone never yields "ready".

## Release boundary

The owner decides what topics and personal views to share, approves consequential disclosures and final public wording, and separately authorizes merge/deploy. This skill does not create GitHub Issues, content quotas, publication schedules, CMS requirements or automatic posting.
