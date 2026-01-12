#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
const server = new Server(
  {
    name: "git-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
// Git komutlarını çalıştır
async function runGitCommand(command, directory) {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: directory || process.cwd(),
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    if (stderr && !stderr.includes("warning:")) {
      throw new Error(stderr);
    }
    return stdout.trim();
  } catch (error) {
    throw new Error(`Git command failed: ${error.message}`);
  }
}
// Tool listesi
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "git_status",
      description: "Get git status (staged, unstaged, untracked files)",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
            default: "current working directory",
          },
        },
      },
    },
    {
      name: "git_log",
      description: "Get git commit log",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          limit: {
            type: "number",
            description: "Number of commits to show",
            default: 10,
          },
          oneline: {
            type: "boolean",
            description: "Show one line per commit",
            default: true,
          },
        },
      },
    },
    {
      name: "git_branch",
      description: "List or create git branches",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          action: {
            type: "string",
            enum: ["list", "create"],
            description: "Action to perform",
            default: "list",
          },
          branch_name: {
            type: "string",
            description: "Branch name (required for create)",
          },
        },
      },
    },
    {
      name: "git_blame",
      description:
        "Show what revision and author last modified each line of a file",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          file: {
            type: "string",
            description: "File path to blame",
          },
        },
        required: ["file"],
      },
    },
    {
      name: "git_add",
      description: "Add file contents to the index (git add)",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          files: {
            type: "array",
            items: { type: "string" },
            description: "Files to add (empty array = add all)",
            default: [],
          },
        },
      },
    },
    {
      name: "git_commit",
      description: "Record changes to the repository (git commit)",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          message: {
            type: "string",
            description: "Commit message",
          },
          files: {
            type: "array",
            items: { type: "string" },
            description: "Specific files to commit (optional)",
          },
        },
        required: ["message"],
      },
    },
    {
      name: "git_checkout",
      description: "Switch branches or restore working tree files",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          branch: {
            type: "string",
            description: "Branch name to checkout",
          },
        },
        required: ["branch"],
      },
    },
    {
      name: "git_stash",
      description: "Stash the changes in a dirty working directory",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          name: {
            type: "string",
            description: "Optional name for the stash",
          },
        },
      },
    },
    {
      name: "git_diff",
      description:
        "Show changes between commits, commit and working tree, etc.",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          commit: {
            type: "string",
            description: "Commit to compare (default: HEAD)",
          },
        },
      },
    },
    {
      name: "git_worktree",
      description: "List or add git worktrees",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory path",
          },
          action: {
            type: "string",
            enum: ["list", "add"],
            description: "Action to perform",
            default: "list",
          },
          path: {
            type: "string",
            description: "Path for the worktree (required for add)",
          },
          branch: {
            type: "string",
            description: "Branch for the worktree (optional for add)",
          },
        },
      },
    },
  ],
}));
// Tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const directory = args?.directory || process.cwd();
  try {
    let result;
    switch (name) {
      case "git_status":
        result = await runGitCommand("git status", directory);
        break;
      case "git_log":
        const limit = args?.limit || 10;
        const oneline = args?.oneline !== false;
        const logFormat = oneline ? "--oneline" : "";
        result = await runGitCommand(
          `git log ${logFormat} -n ${limit}`,
          directory
        );
        break;
      case "git_branch":
        if (args?.action === "create") {
          if (!args?.branch_name) {
            throw new Error("branch_name is required for create action");
          }
          result = await runGitCommand(
            `git branch ${args.branch_name}`,
            directory
          );
        } else {
          result = await runGitCommand("git branch", directory);
        }
        break;
      case "git_blame":
        if (!args?.file) {
          throw new Error("file is required");
        }
        result = await runGitCommand(`git blame ${args.file}`, directory);
        break;
      case "git_add":
        const files = args?.files || [];
        const addTarget = files.length > 0 ? files.join(" ") : ".";
        result = await runGitCommand(`git add ${addTarget}`, directory);
        break;
      case "git_commit":
        if (!args?.message) {
          throw new Error("message is required");
        }
        const commitFiles = args?.files ? args.files.join(" ") : "";
        const message = String(args.message).replace(/"/g, '\\"');
        result = await runGitCommand(
          `git commit -m "${message}" ${commitFiles}`,
          directory
        );
        break;
      case "git_checkout":
        if (!args?.branch) {
          throw new Error("branch is required");
        }
        result = await runGitCommand(`git checkout ${args.branch}`, directory);
        break;
      case "git_stash":
        const stashName = args?.name ? `"${args.name}"` : "";
        result = await runGitCommand(
          `git stash push -m ${stashName}`,
          directory
        );
        break;
      case "git_diff":
        const commit = args?.commit || "HEAD";
        result = await runGitCommand(`git diff ${commit}`, directory);
        break;
      case "git_worktree":
        if (args?.action === "add") {
          if (!args?.path) {
            throw new Error("path is required for add action");
          }
          const branch = args?.branch ? `-b ${args.branch}` : "";
          result = await runGitCommand(
            `git worktree add ${args.path} ${branch}`,
            directory
          );
        } else {
          result = await runGitCommand("git worktree list", directory);
        }
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    return {
      content: [
        {
          type: "text",
          text: result || "Command executed successfully",
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});
// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Git MCP server running on stdio");
}
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
//# sourceMappingURL=index.js.map
