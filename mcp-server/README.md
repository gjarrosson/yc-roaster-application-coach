# YC Roaster MCP Server

[![npm](https://img.shields.io/npm/v/@ycroaster/mcp.svg)](https://www.npmjs.com/package/@ycroaster/mcp)

An [MCP](https://modelcontextprotocol.io) server that turns any MCP-aware
agent into a YC application coach. Roast a full draft, roast a single
section, pull YC's evaluation criteria for any application question — from
Claude.ai, ChatGPT, Cursor, Claude Code, or your own agent built on the
Anthropic / OpenAI SDKs.

Built by [YC Roaster](https://ycroaster.com) (Lobster Capital). Sibling to
the [`yc-application-coach` Skill](../SKILL.md) in this repo.

## Install

Two ways to run it. The hosted server reaches every surface; the local
stdio build is byte-identical and never sends your draft over the network.

### Hosted (any MCP client)

URL: **`https://mcp.ycroaster.com/mcp`**

| Client | How |
| --- | --- |
| Claude.ai | Settings → Connectors → Add custom connector → paste the URL |
| ChatGPT (Developer Mode) | Settings → Connectors → Add → paste the URL |
| Claude Code | `claude mcp add ycroaster https://mcp.ycroaster.com/mcp` |
| Cursor (`~/.cursor/mcp.json`) | `{ "mcpServers": { "ycroaster": { "url": "https://mcp.ycroaster.com/mcp" } } }` |
| Anthropic / OpenAI Agents SDK | Pass the URL when constructing the MCP connector |

### Local stdio (privacy-first)

Zero network egress for the roast tools. See [`PRIVACY.md`](./PRIVACY.md).

```bash
# One-shot via npx (no install)
npx -y @ycroaster/mcp
```

Then in your MCP client config:

```json
{
  "mcpServers": {
    "ycroaster": {
      "command": "npx",
      "args": ["-y", "@ycroaster/mcp"]
    }
  }
}
```

For Claude Code: `claude mcp add ycroaster -- npx -y @ycroaster/mcp`.

## Tools

| Tool | What it does |
| --- | --- |
| `list_questions` | Returns the canonical YC application questions, IDs, and character limits. |
| `get_question_guidance` | Returns YC's evaluation criteria, strong-answer patterns, and common failures for one question. |
| `roast_application` | Returns a critique brief (rubric + draft + output-format instructions) the calling LLM uses to roast the full draft. 50KB hard cap, 20KB soft warning. |
| `roast_section` | Same shape as `roast_application`, scoped to one question. |

The roast tools assemble a **brief**, not a roast. The calling agent's LLM
does the reasoning — the server makes zero LLM calls, so you don't pay
twice and the output stays in your agent's voice and model.

`submit_for_human_review` (hand off a draft to a YC alum for free review at
ycroaster.com) lands in v0.4.

## Privacy

See [`PRIVACY.md`](./PRIVACY.md). Short version: hosted server logs request
metadata only, **not your draft text**. The stdio build keeps everything
on your machine.

## Develop

```bash
cd mcp-server
npm install
npm run build       # generates reference-bundle.ts and compiles TS
npm run start       # stdio mode
npm run inspect     # MCP Inspector against the stdio build
npm run worker:dev  # wrangler dev on :8787 — local hosted server
```

`npm run build` runs `scripts/build-reference.mjs` as a prebuild step,
inlining `../reference/**/*.md` into `src/reference-bundle.ts`. That bundle
is what makes the same code work on Node (stdio) and on Cloudflare Workers
(no filesystem).

## Layout

```
mcp-server/
  src/
    questions.ts          canonical question registry
    roast.ts              critique brief builders, input caps
    reference.ts          bundle accessors
    reference-bundle.ts   generated; markdown inlined from ../reference/
    server.ts             McpServer factory + tool registration
    stdio.ts              stdio entry point
    worker.ts             Cloudflare Worker entry
  scripts/
    build-reference.mjs   generates reference-bundle.ts
  server.json             MCP Registry manifest
  wrangler.toml           Worker config
  PRIVACY.md
  DESIGN.md
```

## Release

Tag-driven. The `mcp-release.yml` workflow runs on `mcp-vX.Y.Z` tags and:

1. Verifies the tag matches `package.json` + `server.json` versions.
2. Publishes `@ycroaster/mcp` to npm with provenance.
3. Publishes the updated `server.json` to the MCP Registry via GitHub OIDC.
4. Deploys the Worker to Cloudflare.

Required repository secrets:

- `NPM_TOKEN` — npm automation token with publish access on `@ycroaster`
- `CLOUDFLARE_API_TOKEN` — Workers deploy permission
- `CLOUDFLARE_ACCOUNT_ID`

Bump the version in three places (`package.json`, `server.json`,
`src/server.ts` `SERVER_VERSION`), commit, tag `mcp-vX.Y.Z`, push the tag.

## License

MIT.
