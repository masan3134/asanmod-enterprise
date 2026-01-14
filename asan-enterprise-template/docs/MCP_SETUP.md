---
type: documentation
agent_role: all
context_depth: 3
required_knowledge: ["mcp"]
last_audited: "2026-01-14"
---

# MCP Server Setup Guide

## What is MCP?

MCP (Model Context Protocol) is a protocol for AI agents to communicate with context servers. The template includes an MCP server setup for enhanced AI agent capabilities.

---

## Prerequisites

- Node.js 20+
- npm or yarn
- Template already installed

---

## MCP Server Location

The MCP server is located in:
```
mcp-servers/asanmod-mcp/
```

---

## Installation

### 1. Navigate to MCP Directory

```bash
cd mcp-servers/asanmod-mcp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Server

```bash
npm run build
```

---

## Configuration

### For Cursor

Add to your Cursor settings (`~/.cursor/config.json`):

```json
{
  "mcpServers": {
    "asanmod": {
      "command": "node",
      "args": ["/path/to/your/project/mcp-servers/asanmod-mcp/dist/index.js"],
      "env": {
        "PROJECT_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

### For Other AI Assistants

Refer to your AI assistant's MCP configuration documentation.

---

## Available Tools

The ASANMOD MCP server provides:

- **File operations**: Safe file reading/writing
- **Project context**: Access to project metadata
- **Configuration**: Read asanmod-core.json

---

## Testing

Test MCP server connection:

```bash
cd mcp-servers/asanmod-mcp
npm test
```

---

## Troubleshooting

### MCP Server Not Connecting

1. Check path in config is absolute
2. Verify server is built (`npm run build`)
3. Check node version (should be 20+)
4. Restart your AI assistant

### Permission Errors

Ensure the MCP server has read access to project files:

```bash
chmod +x mcp-servers/asanmod-mcp/dist/index.js
```

---

## Optional: Disable MCP

If you don't need MCP functionality, you can safely ignore this directory. The template works fine without MCP.

---

*For more information about MCP, visit: https://modelcontextprotocol.io*
