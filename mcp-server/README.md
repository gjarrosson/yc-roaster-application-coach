# YC Roaster MCP Server

An [MCP](https://modelcontextprotocol.io) server that exposes YC Roaster's
coaching and roasting tools to any MCP-aware agent — Claude.ai, ChatGPT,
Cursor, Claude Code, or your own agent built on the Anthropic / OpenAI SDKs.

See [`DESIGN.md`](./DESIGN.md) for the full architecture.

## Status

**v0.2 — hosted preview.** Two transports, four tools.

Tools:

- `list_questions` — canonical YC application questions, IDs, character limits
- `get_question_guidance` — per-question evaluation criteria + strong-answer patterns
- `roast_application` — full-application critique brief (50KB hard cap, 20KB soft)
- `roast_section` — single-question critique brief

The roast tools return a **structured critique brief** (rubric + draft +
output-format instructions). The calling agent's LLM consumes that and
produces the actual roast. The server itself makes zero LLM calls — see
`DESIGN.md` §14.

Coming next:

- Registry publication + npm release (v0.3)
- `submit_for_human_review` to api.ycroaster.com (v0.4)

## Local dev

```bash
cd mcp-server
npm install
npm run build       # generates reference-bundle.ts and compiles TS
npm run start       # stdio mode — waits on stdin
```

`npm run build` runs `scripts/build-reference.mjs` as a prebuild step. That
inlines `../reference/**/*.md` into `src/reference-bundle.ts` so the same
code works on Node (stdio) and Cloudflare Workers (no filesystem).

## Try it with MCP Inspector

```bash
npm run inspect
```

Hit "List Tools" and call any of the four.

## Run the Cloudflare Worker locally

```bash
npm run worker:dev   # wrangler dev on :8787
curl http://localhost:8787/health
```

POST a JSON-RPC message to `/mcp`:

```bash
curl -X POST http://localhost:8787/mcp \
  -H "content-type: application/json" \
  -H "accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

## Deploy the Worker

Pre-flight (see `DESIGN.md` §14 for the full checklist):

1. `wrangler login` to your Cloudflare account.
2. Confirm the `ycroaster.com` zone is on Cloudflare; uncomment the `routes`
   line in `wrangler.toml` once `mcp.ycroaster.com` is wired.
3. Create a rate-limiting namespace in the Cloudflare dashboard
   (Workers → Rate Limiting) — note the namespace ID and replace `"1001"`
   in `wrangler.toml`.

Deploy:

```bash
npm run worker:deploy
```

## Wire it into a client

### Local stdio (privacy-first)

**Claude Code:**

```bash
claude mcp add ycroaster -- node /absolute/path/to/mcp-server/dist/stdio.js
```

**Cursor** (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "ycroaster": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/stdio.js"]
    }
  }
}
```

### Hosted (any client)

Once deployed to `mcp.ycroaster.com` (or your dev Worker URL):

- **Claude.ai:** Settings → Connectors → Add custom connector → URL
- **ChatGPT (Developer Mode):** Settings → Connectors → Add → URL
- **Claude Code:** `claude mcp add ycroaster https://mcp.ycroaster.com/mcp`
- **Cursor:** `{ "mcpServers": { "ycroaster": { "url": "https://mcp.ycroaster.com/mcp" } } }`

## Layout

```
mcp-server/
  src/
    questions.ts          — canonical question registry
    roast.ts              — critique brief builders, input caps
    reference.ts          — bundle accessors (used by tools)
    reference-bundle.ts   — generated; markdown inlined from ../reference/
    server.ts             — McpServer factory + tool registration
    stdio.ts              — stdio entry point
    worker.ts             — Cloudflare Worker entry (Durable Object + rate limit)
  scripts/
    build-reference.mjs   — generates reference-bundle.ts
  wrangler.toml           — Worker config
  package.json
  tsconfig.json
```
