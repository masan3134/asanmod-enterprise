#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

function getDatabaseUrl() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_CONNECTION_STRING;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

function isReadOnlySql(sql) {
  const normalized = String(sql || "")
    .trim()
    .toLowerCase();
  if (!normalized) return false;

  // Allow common read-only statements
  const startsOk =
    normalized.startsWith("select") ||
    normalized.startsWith("with") ||
    normalized.startsWith("show") ||
    normalized.startsWith("explain") ||
    normalized.startsWith("describe");

  if (!startsOk) return false;

  // Block obvious write keywords
  const banned = [
    "insert",
    "update",
    "delete",
    "alter",
    "drop",
    "create",
    "truncate",
    "grant",
    "revoke",
    "vacuum",
  ];

  return !banned.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(normalized));
}

function parseCsv(text) {
  const lines = String(text || "")
    .trim()
    .split("\n")
    .filter(Boolean);
  if (lines.length === 0) return [];

  // Simple CSV parser for Postgres --csv output (no embedded newlines expected)
  const parseLine = (line) => {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
          continue;
        }
        if (ch === '"') {
          inQuotes = false;
          continue;
        }
        cur += ch;
        continue;
      }
      if (ch === ",") {
        out.push(cur);
        cur = "";
        continue;
      }
      if (ch === '"') {
        inQuotes = true;
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out;
  };

  const headers = parseLine(lines[0]);
  const rows = [];
  for (const line of lines.slice(1)) {
    const cols = parseLine(line);
    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = cols[i] ?? null;
    }
    rows.push(row);
  }
  return rows;
}

const server = new Server(
  { name: "ikai-postgres-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Initialize handler (required for MCP SDK)
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  return {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: "ikai-postgres-mcp",
      version: "1.0.0",
    },
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "query",
      description:
        "Run a read-only SQL query against DATABASE_URL and return rows.",
      inputSchema: {
        type: "object",
        properties: {
          sql: { type: "string", description: "SQL query (read-only)" },
        },
        required: ["sql"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "query") {
    return {
      content: [{ type: "text", text: `Error: Unknown tool: ${name}` }],
    };
  }

  try {
    const sql = args?.sql;
    if (!isReadOnlySql(sql)) {
      throw new Error("Only read-only SQL is allowed");
    }

    const dbUrl = getDatabaseUrl();

    const { stdout } = await execFileAsync(
      "psql",
      [dbUrl, "--csv", "-c", String(sql)],
      { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }
    );

    const rows = parseCsv(stdout);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ rows, rowCount: rows.length }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error?.message || String(error)}`,
        },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
