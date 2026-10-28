<template>
  <div v-pre>
    <p>K39 is a travel guide to Kaliningrad Oblast. Its place pages live in PostgreSQL. Editors work through an admin interface, while an AI agent can read and prepare material through MCP, an interface for calling tools.</p>
    <p>The practical task is to let the agent prepare a complete edit: update a title, revise the body, and expand the answers to common questions. An editor needs to inspect the saved proposal and decide what reaches the site. Until that decision is made, readers should receive the previous version of the page. The code needs to enforce this boundary between preparation and publication.</p>
    <p>This account examines public K39 commit <code>0420863</code>, checked on 28 October 2026. It describes the write path and local test results.</p>
    <h2 id="publication-status">
      Blocking <code>published</code> is insufficient
    </h2>
    <p>Suppose a page is already published. An agent submits a new title and body without sending a publication status. If the handler saves those fields to the original row, readers see the changes. There was no transition to <code>published</code>: the row remained published throughout.</p>
    <p>For an editor, preserving the current status during a partial update is useful. K39 explicitly supports it. With restricted access, however, the write decision must consider three things together: the caller&#x27;s permissions, the page&#x27;s current state, and the requested action. Checking the incoming <code>publicationStatus</code> field alone is insufficient. <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/apps/web-app/server/utils/mcp/draft.ts#L30-L81">Status resolution</a>.</p>
    <h2 id="access">
      Caller permissions and page state are separate
    </h2>
    <p>K39 has two content access scopes. <code>draft</code> allows work on drafts and change proposals. <code>editor</code> permits publication and edits to published material. The server determines the scope from the presented bearer token and passes it to the write handler.</p>
    <p>For a place page, a handler running with <code>draft</code> scope rejects an explicit request for <code>published</code> with a 403 error. If the existing page is published or archived, permitted text edits are routed to <code>pending</code>. This is an internal decision about where to store the changes; it does not change the original page&#x27;s status. Editing an existing unpublished draft remains an ordinary draft edit. <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/apps/web-app/server/utils/access.ts#L56-L129">Access scopes</a>, <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/apps/web-app/server/utils/mcp/places.ts#L342-L557">place writer</a>.</p>
    <p>The boundary depends on the permissions actually granted. An agent given the editor token has editor capabilities. If both configured token values are identical, the current implementation resolves them to <code>editor</code>. The setting&#x27;s name does not impose a restriction.</p>
    <h2 id="pending-edits">
      What gets stored
    </h2>
    <p>A proposal is stored separately from the page in <code>content_drafts</code>. It contains the fields of the proposed change. Sequential edits accumulate there: a client can change the title and then submit a new body. The public page reader uses the main row rather than the pending proposal. <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/packages/database/migrations/0035_content_drafts.sql">Draft storage</a>, <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/packages/database/src/repository/content.ts#L224-L295">public reader</a>.</p>
    <p>The save response needs careful interpretation. It can contain the new title, <code>publicationStatus: published</code>, and <code>pendingReview: true</code> at the same time. The new title describes the proposal; the status belongs to the original page. That response does not prove the new text is public. Verification therefore needs to read the stored public state separately from the command&#x27;s return value.</p>
    <p>In the admin interface, an editor can inspect the differences and choose to apply or discard the proposal. Applying it uses the same publication path as the MCP tool. For a place page, updating the main row and deleting the applied draft occur in a transaction. Section synchronization runs afterward; describing every downstream action as part of that transaction would be incorrect. <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/apps/web-app/server/utils/admin/place-draft.ts#L65-L160">Admin helper</a>, <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/packages/database/src/repository/content.ts#L841-L994">repository apply methods</a>, <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/apps/web-app/server/utils/content/save.ts">shared writer</a>.</p>
    <h2 id="apply-bug">
      A bug in the apply step
    </h2>
    <p>Separating a proposal from a page does not, by itself, ensure that applying the proposal works. K39&#x27;s history contains a fix for this request shape:</p>
    <pre><code>{
      &quot;entity&quot;: &quot;place&quot;,
      &quot;slug&quot;: &quot;example-place&quot;,
      &quot;publicationStatus&quot;: &quot;published&quot;
    }</code></pre>
    <p>Here, <code>example-place</code> is a fictional identifier. The intended action is to apply the pending proposal for the selected page. The earlier check treated the presence of <code>slug</code> as a content edit. It consequently took a different branch: it saved the original page and deleted the draft instead of applying the proposed text.</p>
    <p>The fix distinguished an unchanged <code>slug</code>, which only identifies the page, from a new <code>slug</code>, which changes its address. A publication-only request then applied the pending material transactionally. The bug and its correction are documented in the <a href="https://github.com/hmbanan666/k39/commit/8ba0fb46fa3d38aa46a77df5bc7814770bbd4199">16 October commit</a>. That commit does not establish how many real documents were affected or whether it happened in production.</p>
    <p>This is a reason to test the complete intent of a command. A check that an editor may request <code>published</code> would also pass when the implementation incorrectly discards the proposal.</p>
    <h2 id="verification">
      Checking the behavior against a real database
    </h2>
    <p>The repository includes a <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/packages/database/src/repository/test/pending-publish.writer.test.ts#L226-L270">test of the complete scenario</a>:</p>
    <ol>
      <li>Create a published fixture page containing the old text.</li>
      <li>Under <code>draft</code> scope, submit a new title, body and additional fields without specifying a status.</li>
      <li>Check <code>pendingReview: true</code>, then read the main row separately: its old title and body must remain.</li>
      <li>Under <code>editor</code> scope, request publication using the same <code>slug</code>.</li>
      <li>Check the new fields in the main row and the absence of the applied draft.</li>
    </ol>
    <p>During preparation of this article, 181 tests passed across seven selected files: 28 function and call-structure checks, and 153 tests against disposable PostgreSQL 18. Besides the main scenario, the selection covers publication refusals, proposal deletion, parts of conflict handling and other content types. This count describes the verification performed, not the number of failures prevented.</p>
    <p>To reproduce the core set of scenarios, use a checkout of the specified commit, dependencies installed from its lockfile, Node 24.21.0, pnpm 12.15.0 and a running Docker engine. From the K39 root, without a configured database URL, run:</p>
    <pre><code>env -u DATABASE_URL_TEST -u DATABASE_URL -u NUXT_DATABASE_URL \
      pnpm exec vp test run --project packages/database \
      packages/database/src/repository/test/pending-publish.writer.test.ts</code></pre>
    <p>This is one file containing 22 tests included in the executed selection. The test setup provisions a disposable database through Testcontainers. The <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/docs/development.md#checks">development guide</a> documents the prerequisites.</p>
    <p>These tests select permissions inside the process. Separate unit tests check the mapping from tokens to scopes. The verification did not include a real client sending requests to the deployed MCP server. Passing local tests does not establish how production tokens are configured.</p>
    <h2 id="limits">
      Where this protection ends
    </h2>
    <p>The mechanism covers particular write operations. For example, draft-scope changes to photos and opening schedules on a published place are rejected instead of automatically becoming proposals. Venues have their own rules for staging and applying fields. There is no general promise here that every agent command safely becomes a review item. <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/packages/database/src/repository/test/pending-collection-route.writer.test.ts#L914-L981">Refusal tests</a>.</p>
    <p>A transaction also does not guarantee that concurrent work always applies exactly the version an editor previously viewed. Generic place drafts and venue proposals have different concurrency controls; the sequential test described above does not establish their equivalence. <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/packages/database/src/repository/content.ts#L760-L803">Generic draft save</a>.</p>
    <p>Finally, separate editorial review is a workflow rule. The inspected publication path does not require approval from a second independent user. Writing checks do not establish factual accuracy either: some findings remain advisory. Authorization, editing and source verification address different concerns. <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/.agents/skills/k39-publish-review/SKILL.md">Editorial workflow</a>, <a href="https://github.com/hmbanan666/k39/blob/0420863b84fccf47f5f34a9fb30e8353a14ed66f/apps/web-app/server/utils/mcp/publish.ts">publication dispatcher</a>.</p>
    <p>A practical test for this kind of integration is whether a test can show where the proposal is stored, what the reader receives at that moment, and which command moves the changes into the public row. In K39, that check reveals more than the mere presence of a token named <code>draft</code>.</p>
  </div>
</template>
