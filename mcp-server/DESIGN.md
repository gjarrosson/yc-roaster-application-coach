# YC Roaster MCP Server — Design

Status: draft for review
Owner: Lobster Capital (admin@ycroaster.com)
Companion to: the YC Application Coach Skill (`/SKILL.md`)

---

## 1. Goal

Expose YC Roaster's roasting and coaching capability over the Model Context
Protocol so any MCP-aware agent surface can use it, not just Claude Code.

The Skill in this repo activates only inside Claude Code. The MCP server makes
the same product reachable from Claude.ai (Connectors), ChatGPT (Developer
Mode / Apps SDK), Cursor, Windsurf, Zed, and founder-built agents on the
Anthropic and OpenAI SDKs — discovered through the public MCP Registry.

## 2. Non-goals (v1)

- No account system, no billing, no per-user history. Anonymous + rate-limited.
- No model hosting. The server orchestrates tools and prompts; the calling
  agent supplies the LLM.
- No replacement for the Skill. The Skill stays as-is for Claude Code users
  who want the local-file, offline-first coaching loop.
- No write access to a founder's filesystem. The hosted server cannot read
  local files; the stdio build can, but only when invoked locally.

## 3. Surfaces we want to reach

| Surface                     | Transport needed       | Auth needed for v1            | Notes |
| --------------------------- | ---------------------- | ----------------------------- | ----- |
| Claude.ai (Connectors)      | Streamable HTTP (URL)  | None (anonymous OK)           | User pastes the URL into Settings → Connectors. |
| Claude Code CLI             | HTTP or stdio          | None                          | `claude mcp add ycroaster <url>` for hosted, or `claude mcp add ycroaster -- npx ...` for stdio. |
| ChatGPT (Developer Mode)    | Streamable HTTP        | None for tool calls; OAuth later if we want account-bound | Custom connector via Settings → Connectors → Developer Mode. |
| Cursor                      | HTTP or stdio          | None                          | `~/.cursor/mcp.json` entry. |
| Windsurf / Zed / Cline      | HTTP or stdio          | None                          | Same JSON config pattern. |
| Founder-built agents        | HTTP or stdio          | None                          | Anthropic SDK MCP connector or OpenAI Agents SDK MCP client. |

One server reaches all of them when it speaks Streamable HTTP with no auth.

## 4. Architecture — one codebase, two transports

Single TypeScript package at `mcp-server/`. Built on
`@modelcontextprotocol/sdk`. Two entry points share the same tool/resource/prompt
definitions:

- `src/server.ts` — pure tool/resource/prompt registration. No transport.
- `src/worker.ts` — Cloudflare Workers entry. Wraps `server.ts` with the
  Streamable HTTP transport. This is the hosted build at
  `https://mcp.ycroaster.com`.
- `src/stdio.ts` — local entry. Spawned via `npx @ycroaster/mcp` or
  `uvx`-equivalent. Reads from stdio. Used by founders who don't want their
  application text leaving their machine.

Both builds expose an identical tool surface so the founder experience is
identical regardless of where the server runs.

## 5. Tool surface

Four tools at public launch (v0.3), fifth (`submit_for_human_review`) lands
in v0.4 once the api.ycroaster.com endpoint exists. Names chosen to be
self-describing in tool pickers across surfaces.

### 5.1 `roast_application`

Full-application critique. The headline tool — matches the brand.

Input is hard-capped at **50KB**; payloads over **20KB** get a "too long,
tighten before submitting" warning prepended to the critique.

```ts
{
  name: "roast_application",
  description:
    "Roast a complete YC application draft. Returns section-by-section critique " +
    "flagging weak phrasing, unsupported claims, missing evidence, and AI-generated " +
    "texture. Does not rewrite — points at what to fix.",
  inputSchema: {
    application_text: { type: "string", description: "Full application draft, ideally with question headers." },
    batch: { type: "string", description: "Target YC batch (e.g. 'W27'). Optional.", required: false },
    focus: {
      type: "string",
      enum: ["all", "evidence", "voice", "specificity", "competitors", "traction"],
      description: "Narrow the roast. Defaults to 'all'.",
      required: false
    }
  }
}
```

Implementation: loads `reference/common-mistakes.md` and the relevant
question-guidance files, packages them into a structured system prompt, and
returns the critique. Server-side this is a deterministic prompt assembly —
the calling agent's LLM does the reasoning. No LLM call from the server in
v1.

### 5.2 `roast_section`

Per-question critique. Used by Skill-style workflows or by ChatGPT users
working a single section at a time.

```ts
{
  name: "roast_section",
  description: "Roast one YC application question. Sharper than roast_application for a single section.",
  inputSchema: {
    question_id: { type: "string", enum: [/* see §5.6 */] },
    answer: { type: "string" }
  }
}
```

### 5.3 `get_question_guidance`

Returns the per-question coaching guidance — what YC actually evaluates,
strong-answer patterns, probing questions. This is what makes a founder-built
agent useful without bundling our reference data.

```ts
{
  name: "get_question_guidance",
  description: "Get YC's evaluation criteria and strong-answer patterns for one application question.",
  inputSchema: {
    question_id: { type: "string", enum: [/* see §5.6 */] }
  }
}
```

### 5.4 `list_questions`

Returns the canonical YC question list with IDs, text, and character limits.
Lets a calling agent build its own coaching loop.

```ts
{ name: "list_questions", description: "List all YC application questions with current wording.", inputSchema: {} }
```

### 5.5 `submit_for_human_review` (v0.4, not at launch)

Hands off to the existing YC Roaster website. Founder gets real-alum feedback;
we get a top-of-funnel signal. **Not shipped in v0.1–v0.3** — depends on the
new `POST /v1/submissions/mcp` endpoint described in §10 + §14.

```ts
{
  name: "submit_for_human_review",
  description: "Submit a draft application to YC Roaster for free review by a YC alum.",
  inputSchema: {
    application_text: { type: "string" },
    founder_email: { type: "string" },
    company_name: { type: "string" },
    consent_to_share: { type: "boolean", description: "Required: founder consents to sharing the draft with the alum reviewer." }
  }
}
```

POSTs to `https://api.ycroaster.com/v1/submissions/mcp` with a Worker-held
bearer key (new endpoint, JSON-shaped, separate rate limits from the
website form).

### 5.6 Canonical `question_id` values

Match the existing Skill sequence so behavior is consistent across surfaces:
`company_description`, `product_description`, `team`, `location`, `progress`,
`traction`, `idea_origin`, `competitors`, `monetization`, `equity`, `curious`.

## 6. Resources

MCP resources are pull-only references the agent can read. The existing
`reference/` markdown maps cleanly:

| URI                                              | What it is                              |
| ------------------------------------------------ | --------------------------------------- |
| `ycroaster://reference/application-questions`    | Canonical question list                 |
| `ycroaster://reference/successful-patterns`      | What strong answers look like           |
| `ycroaster://reference/common-mistakes`          | What weak answers look like and why     |
| `ycroaster://reference/question/{question_id}`   | One question's full guidance            |
| `ycroaster://examples/weak-vs-strong`            | Before/after answer pairs               |

Resources are cheap — we should expose all of `reference/` so agents that
prefer reading over tool-calling (Cursor's composer, for instance) can ground
themselves.

## 7. Prompts

MCP prompts surface as slash-commands in Claude Code / Claude.ai / Cursor.

- `/yc-roast` → "Roast my YC application draft" — paste-and-go.
- `/yc-coach` → invokes the Skill-equivalent iterative coaching loop, with a
  `section` argument.
- `/yc-rebuttal` → loads `prompts/rebuttal-prompt.md` for pushback drills.

These give founders a one-keystroke entry point on every surface that
supports MCP prompts.

## 8. Transport & deployment

### Hosted (primary)

- Cloudflare Workers, deployed via `wrangler`.
- Streamable HTTP transport from `@modelcontextprotocol/sdk` (the current
  spec — replaces deprecated HTTP+SSE).
- Custom domain `mcp.ycroaster.com` (CNAME to the Workers route).
- No Durable Objects required for v1 — server is stateless. Add later if we
  introduce sessions.

### Local stdio (secondary)

- Published to npm as `@ycroaster/mcp`. Founders add to their MCP client
  config with `npx @ycroaster/mcp` (no install step).
- Same tool/resource/prompt set, same reference data bundled. Preserves the
  Skill's "nothing leaves your machine" story for founders who want it.

### Build & release

- `pnpm` workspace at `mcp-server/`.
- CI: typecheck, lint, build both transports, publish to npm + deploy to
  Workers on `main`. (Wire after the design is approved.)

## 9. Auth & rate limiting (v1)

Anonymous. The server exposes its URL publicly with no token requirement.

Rate limit at the Cloudflare edge:

- 20 `roast_application` calls per IP per hour
- 60 `roast_section` calls per IP per hour
- 5 `submit_for_human_review` calls per IP per day
- Reads (`get_question_guidance`, `list_questions`, resources) uncapped

429 response includes a `Retry-After` header so well-behaved clients back off
cleanly. Abuse beyond rate limits handled by Cloudflare WAF.

OAuth deferred to v2 when we want to bind usage to a YC Roaster account
(submission history, multi-section continuity, eventual paid tiers).
Dynamic Client Registration via the Registry will make this painless when
we get there.

## 10. Privacy & data handling

This is where the hosted build diverges from the Skill's current pitch, and
we need to be explicit about it.

- **Hosted server:** request bodies (application text) pass through Cloudflare
  and our Worker. Logged headers + IP + tool name + duration. **Application
  text is not logged or persisted.** Worker memory only, dropped after the
  response. Document this in the server's published privacy notice.
- **Submission tool:** the one exception — `submit_for_human_review` does
  persist the draft, by design, and requires explicit `consent_to_share`.
- **Stdio build:** zero network egress for the roast tools. The submission
  tool is the only one that calls out (and is opt-in).
- **No telemetry by default.** Optional anonymous counter (tool name, no
  payload) gated behind an env var, off in published builds.

The README will need a short section calling out: "The Skill is offline. The
hosted MCP is not — here's exactly what we log and don't."

## 11. Registry publication

The MCP Registry (registry.modelcontextprotocol.io) is how Claude.ai,
ChatGPT, and Cursor's discovery surfaces find new servers. We publish a
`server.json` manifest plus a GitHub-verified namespace.

Sketch:

```jsonc
{
  "name": "io.github.gjarrosson/yc-roaster",
  "description": "Roast and coach Y Combinator application drafts. Built by YC Roaster (Lobster Capital).",
  "repository": { "url": "https://github.com/gjarrosson/yc-roaster-application-coach", "source": "github" },
  "version": "0.1.0",
  "packages": [
    { "registry_name": "npm", "name": "@ycroaster/mcp", "version": "0.1.0", "transport": { "type": "stdio" } }
  ],
  "remotes": [
    { "transport_type": "streamable-http", "url": "https://mcp.ycroaster.com/mcp" }
  ]
}
```

Publish flow: `mcp-publisher publish` from CI on tagged releases, using a
GitHub OIDC token so the namespace is verified-by-repo.

## 12. Per-surface install snippets

These belong in the published README once the server ships. Each is a
two-line copy-paste:

**Claude.ai** — Settings → Connectors → Add custom connector →
`https://mcp.ycroaster.com/mcp`.

**ChatGPT (Developer Mode)** — Settings → Connectors → Add → same URL.

**Claude Code** — `claude mcp add ycroaster https://mcp.ycroaster.com/mcp`.

**Cursor** — add to `~/.cursor/mcp.json`:
```json
{ "mcpServers": { "ycroaster": { "url": "https://mcp.ycroaster.com/mcp" } } }
```

**Local stdio (privacy-first)** — replace the URL with
`{ "command": "npx", "args": ["-y", "@ycroaster/mcp"] }`.

**Anthropic SDK / OpenAI Agents SDK** — pass the URL as an MCP connector
when constructing the agent.

## 13. Observability

- Cloudflare Workers Logs for request lines (method, tool name, status,
  duration, IP). No bodies.
- Cloudflare Analytics for traffic + 4xx/5xx breakdown.
- Sentry (or equivalent) for unhandled exceptions only. Scrub request bodies
  in the `beforeSend` hook.
- Weekly "tools called" summary emailed to admin@ — pulled from logs, no
  founder content.

## 14. Resolved decisions

- **Server-side LLM calls:** none. The server is a prompt assembler and
  reference-data oracle; the calling agent's LLM does all reasoning. Zero
  inference cost on us, no model-drift score rot. If founders ever beg for
  a numeric score, ship a separate `score_application` tool so latency and
  cost are explicit at the call site.
- **Hosted domain:** `mcp.ycroaster.com`. Subdomain (not a path on the main
  site) so the Worker has its own Cloudflare route, rate limits, and kill
  switch. **Action item:** confirm the `ycroaster.com` zone is on
  Cloudflare and the `mcp` record is free before v0.2 deploy.
- **npm scope:** `@ycroaster` preferred, `@lobstercap/yc-roaster-mcp` as
  fallback. Avoid unscoped — scoped packages prevent sibling squatting
  (`@ycroaster/cli`, etc.) and signal trust in the registry. **Action
  item:** run `npm view @ycroaster` to confirm availability and claim it
  if free.
- **Submission endpoint:** new dedicated `POST /v1/submissions/mcp` on
  api.ycroaster.com, JSON-shaped, bearer-keyed, separate rate limits.
  Reusing the website's form endpoint is rejected — it's CSRF-protected
  and form-shaped, bolting MCP onto it is a maintenance trap. **Action
  item:** spec and build this endpoint before v0.4; until then,
  `submit_for_human_review` is skipped from the tool surface (not
  deep-link fallback — we want the one-step founder experience or
  nothing).
- **Input length cap on `roast_application`:** 50KB hard cap, 20KB soft
  warning. Below 20KB: no warning. 20–50KB: roast plus "draft is unusually
  long — YC partners spend ~3 minutes per app, tighten it." Over 50KB:
  clean MCP error citing the limit.

## 15. Phased milestones

**v0.1 — internal scaffold**
- Repo layout, SDK wired, `list_questions` + `get_question_guidance` working
  over stdio. No Worker yet. Tested via `mcp inspector`.

**v0.2 — hosted preview**
- Worker deployed at `mcp.ycroaster.com`. `roast_application` and
  `roast_section` added. Rate limits in place. Internal Slack share.

**v0.3 — public launch**
- Registry submission, npm publish, README updated with install snippets
  for all five surfaces. Privacy notice published. Tweet from
  @lobstercapital.

**v0.4 — submission integration**
- `submit_for_human_review` wired to api.ycroaster.com. Consent flow tested
  end-to-end.

**v1.0 — accounts (later)**
- OAuth with DCR. Per-founder history. Foundation for paid tiers.

---

## Appendix A — Why not just the Skill?

Skills only activate inside Claude Code. They can't be installed in Claude.ai
or ChatGPT, and Cursor doesn't read them. The Skill stays — it's the best
experience for founders already in Claude Code with their full repo as
context. The MCP server is the only way to reach every other surface, and
the only way the Registry can discover us.

## Appendix B — Why anonymous v1

Every auth step is a drop-off. ChatGPT, Claude.ai, and Cursor's add-a-server
flows all complete in one paste when there's no auth. We can add OAuth the
day we have a reason to gate (paid tier, per-user history) and the Registry's
DCR support means existing clients re-auth without a manual config change.
