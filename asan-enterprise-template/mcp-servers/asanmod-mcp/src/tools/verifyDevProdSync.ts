/**
 * Tool: asanmod_verify_dev_prod_sync
 * DEV-PROD senkronizasyon kontrolü
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

export interface DevProdSyncResult {
  success: boolean;
  buildOutput: {
    devExists: boolean;
    prodExists: boolean;
    devBuildId?: string;
    prodBuildId?: string;
    devSize?: string;
    prodSize?: string;
    synced: boolean;
  };
  schema: {
    devTables: number;
    prodTables: number;
    devEnums: number;
    prodEnums: number;
    synced: boolean;
  };
  environmentVariables: {
    devEnvExists: boolean;
    prodEnvExists: boolean;
    synced: boolean;
  };
  errors: string[];
}

export async function verifyDevProdSync(): Promise<DevProdSyncResult> {
  const result: DevProdSyncResult = {
    success: true,
    buildOutput: {
      devExists: false,
      prodExists: false,
      synced: false,
    },
    schema: {
      devTables: 0,
      prodTables: 0,
      devEnums: 0,
      prodEnums: 0,
      synced: false,
    },
    environmentVariables: {
      devEnvExists: false,
      prodEnvExists: false,
      synced: false,
    },
    errors: [],
  };

  const projectRoot = process.cwd();
  const frontendPath = join(projectRoot, "frontend");

  // Build output comparison
  const devBuildPath = join(frontendPath, ".next-dev");
  const prodBuildPath = join(frontendPath, ".next-prod");

  result.buildOutput.devExists = existsSync(devBuildPath);
  result.buildOutput.prodExists = existsSync(prodBuildPath);

  if (result.buildOutput.devExists) {
    const devBuildIdPath = join(devBuildPath, "BUILD_ID");
    if (existsSync(devBuildIdPath)) {
      try {
        result.buildOutput.devBuildId = execSync(`cat "${devBuildIdPath}"`, {
          encoding: "utf-8",
        }).trim();
      } catch (e) {
        // Ignore
      }
    }
  }

  if (result.buildOutput.prodExists) {
    const prodBuildIdPath = join(prodBuildPath, "BUILD_ID");
    if (existsSync(prodBuildIdPath)) {
      try {
        result.buildOutput.prodBuildId = execSync(`cat "${prodBuildIdPath}"`, {
          encoding: "utf-8",
        }).trim();
      } catch (e) {
        // Ignore
      }
    }
  }

  result.buildOutput.synced =
    result.buildOutput.devBuildId === result.buildOutput.prodBuildId;

  // Schema comparison (simplified - using psql)
  try {
    const devTables = execSync(
      `psql -h localhost -U ikaiuser -d ikai_dev_db -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '\\_%';" 2>/dev/null || echo "0"`,
      {
        encoding: "utf-8",
        env: { ...process.env, PGPASSWORD: "ikaipass2025" },
      }
    ).trim();
    result.schema.devTables = parseInt(devTables) || 0;
  } catch (e) {
    result.errors.push(`Cannot get DEV tables: ${e}`);
  }

  try {
    const prodTables = execSync(
      `psql -h localhost -U ikaiuser -d ikai_prod_db -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '\\_%';" 2>/dev/null || echo "0"`,
      {
        encoding: "utf-8",
        env: { ...process.env, PGPASSWORD: "ikaipass2025" },
      }
    ).trim();
    result.schema.prodTables = parseInt(prodTables) || 0;
  } catch (e) {
    result.errors.push(`Cannot get PROD tables: ${e}`);
  }

  result.schema.synced = result.schema.devTables === result.schema.prodTables;

  // Environment variables (file existence only - content is gitignored)
  const devEnvPath = join(frontendPath, ".env.dev");
  const prodEnvPath = join(frontendPath, ".env.prod");

  result.environmentVariables.devEnvExists = existsSync(devEnvPath);
  result.environmentVariables.prodEnvExists = existsSync(prodEnvPath);
  result.environmentVariables.synced =
    result.environmentVariables.devEnvExists ===
    result.environmentVariables.prodEnvExists;

  // Success kontrolü
  if (
    !result.buildOutput.synced ||
    !result.schema.synced ||
    result.errors.length > 0
  ) {
    result.success = false;
  }

  return result;
}
