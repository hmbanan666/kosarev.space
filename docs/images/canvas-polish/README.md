# Canvas polish review captures

Local Chromium screenshots, not deployment evidence. Repository/feed observations
come from the public snapshot recorded on 16 November 2026 (see
[original provenance](../activity-canvas/README.md)). The fixture now extends its
90-day observations with **synthetic** older daily counts to exercise a full
365-day calendar and year total; it is not a record of the owner's private
contributions. Writing uses the existing synthetic database publication.

After configuring matching `NUXT_DATABASE_URL` and
`CASE_CONTENT_TEST_DATABASE_URL` for a migrated local test database:

```sh
CANVAS_SCREENSHOTS=after pnpm exec playwright test e2e/activity-canvas.test.ts
```

This writes RU home captures at 1280, 1440, 1920 and 390px, EN at 1440px,
the RU project panel at 1280px, and `/projects` with its normal footer at
1280px. The 390px capture emulates touch input; presence stays unmounted there.
Browser assertions cover card overflow, 53/26 calendar weeks, full hero text,
panel navigation and presence moving between the canvas and page footer.
