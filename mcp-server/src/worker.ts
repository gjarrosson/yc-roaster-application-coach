import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools, SERVER_VERSION } from "./server.js";

export interface Env {
  MCP_LIMITER: RateLimitBinding;
  MCP_OBJECT: DurableObjectNamespace;
}

interface RateLimitBinding {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}

export class YCRoasterMCP extends McpAgent<Env> {
  server = new McpServer({ name: "ycroaster", version: SERVER_VERSION });

  async init(): Promise<void> {
    registerTools(this.server);
  }
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function jsonRpcRateLimitError(): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message:
          "Rate limit exceeded. Try again in a minute. Per-IP limit applies across all tools in v0.2.",
      },
      id: null,
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": "60",
      },
    },
  );
}

const mcpHandler = YCRoasterMCP.serve("/mcp");

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({ status: "ok", version: SERVER_VERSION }),
        { headers: { "content-type": "application/json" } },
      );
    }

    if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
      const { success } = await env.MCP_LIMITER.limit({ key: clientIp(request) });
      if (!success) return jsonRpcRateLimitError();
      return mcpHandler.fetch(request, env, ctx);
    }

    return new Response(
      "YC Roaster MCP server. POST JSON-RPC to /mcp. See https://github.com/gjarrosson/yc-roaster-application-coach for client setup.",
      { status: 404 },
    );
  },
} satisfies ExportedHandler<Env>;
