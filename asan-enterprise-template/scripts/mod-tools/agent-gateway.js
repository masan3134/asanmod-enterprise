import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

/**
 * ASANMOD v7.0 Agent Gateway (Project Velocity)
 * Wraps legacy bash scripts and returns structured JSON with Neuro-Map support.
 */
class AgentGateway {
  static SCRIPTS_DIR = "./scripts/mod-tools/";

  async runCommand(scriptName, args = []) {
    const scriptPath = path.join(AgentGateway.SCRIPTS_DIR, scriptName);
    try {
      const { stdout, stderr } = await execAsync(
        `bash ${scriptPath} ${args.join(" ")}`
      );
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout?.trim() || "",
        stderr: error.stderr?.trim() || "",
        error: error.message,
      };
    }
  }

  async verify() {
    const result = await this.runCommand("fast-verify.sh");
    // Parse result for agents
    const isReady = result.stdout.includes("SYSTEM READY");
    return {
      success: result.success && isReady,
      raw: result.stdout,
      isSystemReady: isReady,
    };
  }

  async status() {
    const { stdout } = await execAsync(
      "node scripts/mod-tools/quick-status.cjs"
    );
    try {
      // Assuming quick-status might be updated to JSON or we parse it
      return {
        success: true,
        data: stdout.trim(),
      };
    } catch (e) {
      return { success: false, error: "Failed to parse status" };
    }
  }
}

const gateway = new AgentGateway();

// CLI support for direct agent usage if needed
if (process.argv[1].endsWith("agent-gateway.js")) {
  const action = process.argv[2];
  if (action === "verify") {
    gateway.verify().then((res) => console.log(JSON.stringify(res, null, 2)));
  } else if (action === "status") {
    gateway.status().then((res) => console.log(JSON.stringify(res, null, 2)));
  }
}

export default gateway;
