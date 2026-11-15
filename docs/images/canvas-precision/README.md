# Canvas precision review captures

Local Chromium captures at 1024, 1280, 1440 and 1920px wide with a 1000px
viewport height, plus 390 × 844 mobile. Images include the full page to show
how the canvas, catalog disclosure and footer meet.

- `before-en-*`: unchanged `5c55dd96858b3ab114faec0add9a96d528096b1d`, after PRs #29 and #30.
- `after-en-*` and `after-ru-*`: the precision implementation in this branch.

Both versions use the same dedicated local test database and synthetic Writing
publication. The native online face belongs to a local browser session. These
are development previews, with the development toolbar hidden for capture;
they are not deployment evidence or a publication change.

The browser geometry checks run at these five widths in both languages, on
the home and on project/Writing pages. They enforce shared horizontal edges,
equal canvas margins, a single gap, card and action insets, centered native
presence, consistent control heights, no content overflow and no hydration
warnings. The existing unit test checks that every default grid cell is
occupied exactly once.

To refresh after-captures, configure the test database as described in the
root README, then run:

```sh
CANVAS_SCREENSHOTS=after pnpm exec playwright test e2e/canvas-precision.test.ts
```

Geometry assertions are the automated regression gate. Screenshots are
committed review evidence, without fragile cross-platform pixel comparisons.
