# YC Roaster MCP — Privacy Notice

The hosted MCP server at `https://mcp.ycroaster.com/mcp` is the network path
for tools called by Claude.ai, ChatGPT, Cursor, and any other MCP client you
configure with that URL. This notice covers what data the server sees, logs,
and stores.

## What we log

- Request metadata: HTTP method, path, status code, response time, your IP
  address.
- The name of the MCP tool called (e.g. `roast_application`,
  `get_question_guidance`).
- Worker errors and stack traces.

## What we do NOT log

- **The text you pass to any tool.** Application drafts, draft answers,
  anything in tool arguments — none of it is logged, written to disk, or
  persisted. It lives in Worker memory for the duration of the request,
  then is dropped.
- Anything in tool responses.

## What we store

Nothing tied to a draft or a founder, with one explicit exception:

- **`submit_for_human_review`** (landing in a future release) will persist a
  draft on submission — by design, and only when called with
  `consent_to_share: true`. The persisted draft goes to ycroaster.com for
  review by a YC alum. You can ask for it to be deleted by emailing
  [admin@ycroaster.com](mailto:admin@ycroaster.com).

## Offline alternative

If you'd rather no application text touch our servers, run the stdio build
locally:

```bash
npx -y @ycroaster/mcp
```

The stdio build is byte-identical to the hosted one; only the transport
differs. `submit_for_human_review` is the only tool that ever makes a
network request, and only when you explicitly invoke it.

## Rate limiting

The hosted server applies a per-IP rate limit (60 requests per minute) at
the Cloudflare edge. If you hit it, expect a 429 with a `Retry-After`
header. Self-hosting via the stdio build sidesteps this entirely.

## Contact

[admin@ycroaster.com](mailto:admin@ycroaster.com)
