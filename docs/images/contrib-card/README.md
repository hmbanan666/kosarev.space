# Contribution card and panel review

Local Chromium captures at 1440×900 and 390×900, in Russian and English.
These are review evidence, not deployment evidence. Activity uses the existing
recorded public snapshot and synthetic rolling-year calendar; the calendar
contains 1,305 contributions across 192 active days. Private repository names
are neither required nor introduced.

- `card-*`: the calendar on the home canvas (mobile uses the existing list and
  latest 26 weeks), yearly total, five-level legend and active-day count.
- `panel-*`: the single title, explanation, profile link and summary statistics.
- `panel-details-*`: the panel scrolled to its monthly breakdown and public feed.
- `header-*-390`: the locale control beside the compact mobile name.

After configuring the migrated local test database with matching
`NUXT_DATABASE_URL` and `CASE_CONTENT_TEST_DATABASE_URL` as in the root README:

```sh
CONTRIB_SCREENSHOTS=1 pnpm exec playwright test e2e/contrib-card.test.ts
```

The test asserts tooltip date/count on hover, keyboard focus and touch-down,
arrow-key movement, dismissal, card surface clicks, profile link attributes,
monthly counts, empty and partial data, panel history and refresh. Tooltips and
OS cursor appearance are verified in the browser rather than the PNGs.
`e2e/nav-canvas-2.test.ts` additionally measures the locale control against the
visible name text at 390px and preserves desktop gutter/height assertions.

Statistics use the snapshot's UTC dates, not the browser clock. A rolling year
can cover 13 calendar months; partial first/last months remain separate and
include their year. Missing dates and zero-count days break streaks. Equal
busiest days or months resolve to the earliest date. All-zero calendars have
zero active days and no busiest day. The public 90-day fallback retains its
coverage label and incomplete-data notice.
