# Navigation, canvas and conversation review

Local Chromium captures from 16 November 2026, in Russian and English, at
1440×900 and 390×900. These show the implementation under review, not deployment.

- `home-*`: locale beside the name, symmetric desktop header gutters, floating
  launcher above the desktop footer strip, and intentionally clipped cards.
- `inner-*`: the same floating launcher on Contact.
- `zoom-out-*-1440`: the bounded 28×18 board at 25%, including paused/archive
  projects and the conditional latest-publication card.
- `hover-*-1440`: the corner grip revealed by hovering the left edge. Chromium
  screenshots omit the operating-system cursor; the test asserts `grab` on
  every edge and `grabbing` during movement.
- `queue-*`: a visible pending follow-up while the first request is held open;
  the input remains enabled and Stop and Send are available together.

Activity uses the repository's recorded public snapshot. The publication is the
existing synthetic database fixture, explicitly labelled in the image; it is
not new public writing. Chat responses are intercepted test data. The mobile
home remains a readable list and has no drag or zoom controls.

After configuring the local test database as described in the root README:

```sh
NAV_CANVAS_SCREENSHOTS=1 pnpm exec playwright test e2e/nav-canvas-2.test.ts
```

The same test verifies launcher visibility and restored focus, all four drag
edges, body-click details, the zoom floor, archive visibility and sequential
queued requests. The dedicated `pnpm run test:agent` additionally exercises Stop
followed by a queued request through the real server and a local provider stub.
