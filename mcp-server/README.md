# YC Roaster MCP Server

An [MCP](https://modelcontextprotocol.io) server that exposes YC Roaster's
coaching reference data and (soon) roasting tools to any MCP-aware agent —
Claude.ai, ChatGPT, Cursor, Claude Code, or your own agent built on the
Anthropic / OpenAI SDKs.

See [`DESIGN.md`](./DESIGN.md) for the full architecture.

## Status

**v0.1 — internal scaffold.** stdio transport only. Two tools live:

- `list_questions` — canonical YC application questions, IDs, and character limits
- `get_question_guidance` — per-question evaluation criteria, strong-answer patterns, common failures

Coming next:

- `roast_application`, `roast_section` (v0.2)
- Hosted Cloudflare Worker at `mcp.ycroaster.com` (v0.2)
- Registry publication + npm release (v0.3)
- `submit_for_human_review` (v0.4)

## Local dev

```bash
cd mcp-server
npm install
npm run build
npm run start    # waits on stdio
```

## Try it with MCP Inspector

```bash
npm run inspect
```

This launches `@modelcontextprotocol/inspector` against the stdio build —
hit "List Tools" and call `list_questions` or `get_question_guidance`.

## Wire it into a client (local dev)

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

The hosted URL install snippets in `DESIGN.md` §12 land with v0.3.

## Layout

```
mcp-server/
  src/
    questions.ts   — canonical question registry (id, text, char limit)
    reference.ts   — loads markdown from ../reference/question-guidance/
    server.ts      — McpServer construction, tool registration
    stdio.ts       — stdio entry point
  package.json
  tsconfig.json
```

`reference/` is at the repo root, shared with the Skill. For npm
publication, a build step copies it into the package (TBD in v0.3 — see
`DESIGN.md` §15).
