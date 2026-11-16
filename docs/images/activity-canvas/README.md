# Activity canvas review captures

Local Chromium captures in RU/EN at 1280, 1440, 1920 and 390px, plus open
project panels at 1280 and 390px. These are review evidence, not production
screenshots. The four `../canvas-home-*.png` references use these captures.

The browser suite uses `apps/web-app/tests/fixtures/activity-snapshot.json`,
recorded from public GitHub REST responses on 16 November 2026. It contains
Context, K39 and kosarev.space repository/language responses, up to 30 author
commits and 15 PRs per repo. Counts and the 90-day calendar are derived from
those recorded items; no activity is synthesized. It is deliberately a partial
sample. Writing uses the existing synthetic publication database fixture.

`github-repo.json` and `github-commits.json` retain a minimal public REST
response for boundary tests. Private/fork/rate-limit/calendar security cases
mutate fixture inputs; they are not claims about real private activity.

With matching local test database URLs and Chromium dependencies configured:

```sh
CANVAS_SCREENSHOTS=after pnpm exec playwright test e2e/activity-canvas.test.ts
```

The browser test server disables upstream activity requests. Capture content
is deterministic apart from localized relative times and native presence faces.
The previous home is preserved under `../canvas-fullscreen/after-*.png` at
base commit `c1bae5867a9254da18816c70e6b6a7d40e709e87`.
