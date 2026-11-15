# Fullscreen canvas review captures

Local Chromium previews, with the development toolbar hidden. These are review
evidence, not deployment screenshots. Home before captures use unchanged
`adfb5b0` (PR #31); after captures show the fullscreen canvas and route migration.

Both Russian and English are captured at:

| Width | Height | Layout |
| --- | --- | --- |
| 1024 | 800 | Fitted desktop canvas |
| 1280 | 800 | Fitted desktop canvas |
| 1440 | 800 | Fitted desktop canvas |
| 1920 | 1080 | Fitted desktop canvas |
| 390 | 844 | Stacked mobile blocks and full footer |

`before-{locale}-{width}.png` and `after-{locale}-{width}.png` are full-page
captures. Desktop after captures have no page scroll. Mobile retains the
normal footer; before captures also include the former catalog disclosure and
full contact footer.

The new `/projects`, `/cases` and `/contact` pages are captured at 1280 × 800
in both languages, as `{route}-{locale}-1280.png`. Writing uses the repository's
synthetic publication fixture in both before and after captures. Case index
captures use the tracked reviewed engineering-case bundle, with synthetic tags
where metadata is absent and zero counters. No production database was read or
changed.

The refreshed `../canvas-home-*.png` files match the 1280px desktop and 390px
mobile after captures. Browser geometry checks live in
[`canvas-fullscreen.test.ts`](../../../e2e/canvas-fullscreen.test.ts) and
[`canvas-precision.test.ts`](../../../e2e/canvas-precision.test.ts); tests assert
layout and navigation without pixel-perfect font comparisons.
