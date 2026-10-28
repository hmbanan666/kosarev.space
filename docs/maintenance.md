# Bounded maintenance

The current roadmap ends with a verified site and a repeatable publishing path.
It does not promise future articles, products or career events, and it creates
no recurring automation, issue tracker or extra platform.

## Update when there is a real change

- A role, availability or contact change: update the canonical career facts and
  relevant RU/EN copy together, then check CV, print/PDF and visible contacts.
- A product release or closure: check the product repository and public behavior
  separately; update status, destination and screenshot when supported. Keep
  historical work accessible rather than implying it is still operating.
- A completed experiment or useful observation: use the [publishing guide](publishing.md).
  Add a real note, digest or article to the existing feed. Add a case only when
  the material is an engineering responsibility/outcome account in its own right.
- A corrected source or discovered factual error: correct the affected material
  with an appropriate explanation and preserve its URL and first-publication date.
- A reported defect or dependency alert: reproduce the relevant failure, make
  the smallest justified fix and run the checks that cover the affected behavior.

No arbitrary publishing quota or architectural expansion is required. A quiet
period with accurate material is preferable to manufactured activity.

## Release baseline

For each site release, check the exact PR head, applicable test results and
review findings. After authorized merge/deployment, match the deployment record
to the merged commit and verify the changed routes publicly in RU/EN. Exercise
mobile and desktop navigation, code/text wrapping and language switching.
Retain representative no-JavaScript checks for the professional/product/Writing
paths, contact links and CV/PDF access. Do not create views or reactions merely
to test engagement features on production.

Content publication, database changes and code deployment are separate actions.
Writing content uses the [revision publication workflow](publishing.md), while
case-content transactions follow the separate
[deployment procedure](deploy.md#case-content-updates). Keep a
reversible release path and sanitized evidence of what was actually checked.

## Verified baseline 28 October 2026

[PR #19](https://github.com/hmbanan666/kosarev.space/pull/19) deployed as
`543b60c`; Dokploy reported success at 17:17:51 UTC. Separate public checks
completed after deployment:

- **Professional:** both localized catalogs contain 14 cases; all seven
  approved revised texts match the tracked content bundle. Mobile/desktop checks
  passed for the six featured cases and their order, full-list access, billing
  search, EXPI detail and context-preserving back navigation. Email/Telegram
  links were present, CV and print routes responded, and both downloaded PDFs
  had valid signatures.
- **Products:** K39 and Woodlands copy and image hashes match the approved
  repository assets. Destination links, labelled Woodlands demo, retained
  archive and responsive navigation passed in RU/EN. Both home pages also
  showed the products and archive without JavaScript. This verifies their
  presentation on the portfolio, not the products' internal behavior.
- **Writing:** both feeds and the unchanged K39 article passed responsive,
  language, metadata, related-project and no-JavaScript checks. Unknown slugs
  return 404; the sitemap contains both localized feed and article addresses.
  No browser page errors or horizontal overflow were observed in tested views.

The release passed hosted CI on `03b2697`; local checks covered lint, types,
41 unit tests, 6 database content tests, 54 E2E tests and the build/PDF output.
Independent standards and specification reviews had no actionable findings.
CodeRabbit did not perform its PR #19 review because its free review allowance
was exhausted; a passed status was not counted as a completed review.

These observations close the bounded Phase 5 handoff. They are dated release
evidence, not continuous monitoring, a complete security audit or a guarantee
about future releases. Production verification made no content transactions or
deliberate engagement writes; browser checks blocked case view/reaction calls.

## Scope after this handoff

Phase 5 completion means the current baseline was checked and these maintenance
responsibilities are documented. It does not mark future evolution complete.
New material, private disclosures, creative work or a larger publishing system
still needs its own owner-approved scope. The private book remains outside the
website work. There is no monitoring job that will silently publish or deploy
future changes.
