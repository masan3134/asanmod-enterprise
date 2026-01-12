/**
 * Brain Database Pruning Script
 * Removes old data to maintain database performance
 */

import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PruneOptions {
  dryRun?: boolean;
  maxAgeDays?: number;
  keepMinimum?: number;
}

interface PruneStats {
  commits_before: number;
  commits_after: number;
  solutions_before: number;
  solutions_after: number;
  deleted: {
    commits: number;
    solutions: number;
  };
}

export function pruneOldData(options: PruneOptions = {}): {
  dryRun: boolean;
  stats: PruneStats;
  message: string;
} {
  const { dryRun = true, maxAgeDays = 90, keepMinimum = 100 } = options;

  const dbPath = join(__dirname, "..", "data", "ikai-brain.db");
  const db = new Database(dbPath);

  const stats: PruneStats = {
    commits_before: 0,
    commits_after: 0,
    solutions_before: 0,
    solutions_after: 0,
    deleted: {
      commits: 0,
      solutions: 0,
    },
  };

  try {
    // Count before
    const commitsCount = db
      .prepare("SELECT COUNT(*) as c FROM git_commits")
      .get() as { c: number };
    stats.commits_before = commitsCount.c;

    const solutionsCount = db
      .prepare("SELECT COUNT(*) as c FROM error_solutions")
      .get() as { c: number };
    stats.solutions_before = solutionsCount.c;

    if (!dryRun) {
      // Delete old commits (keep important ones)
      const deleteOldCommits = db.prepare(`
        DELETE FROM git_commits 
        WHERE created_at < datetime('now', '-' || ? || ' days')
        AND has_brain_block = 0
        AND id NOT IN (
          SELECT id FROM git_commits 
          ORDER BY created_at DESC 
          LIMIT ?
        )
      `);

      deleteOldCommits.run(maxAgeDays, keepMinimum);

      // Delete unused error solutions (never marked successful)
      const deleteUnusedSolutions = db.prepare(`
        DELETE FROM error_solutions
        WHERE success_count = 0
        AND created_at < datetime('now', '-30 days')
      `);

      deleteUnusedSolutions.run();
    }

    // Count after
    const commitsCountAfter = db
      .prepare("SELECT COUNT(*) as c FROM git_commits")
      .get() as { c: number };
    stats.commits_after = commitsCountAfter.c;

    const solutionsCountAfter = db
      .prepare("SELECT COUNT(*) as c FROM error_solutions")
      .get() as { c: number };
    stats.solutions_after = solutionsCountAfter.c;

    stats.deleted.commits = stats.commits_before - stats.commits_after;
    stats.deleted.solutions = stats.solutions_before - stats.solutions_after;

    db.close();

    return {
      dryRun,
      stats,
      message: dryRun
        ? `Dry run complete - would delete ${stats.commits_before - stats.commits_after} commits, ${stats.solutions_before - stats.solutions_after} solutions`
        : `Pruned ${stats.deleted.commits} commits, ${stats.deleted.solutions} solutions`,
    };
  } catch (error) {
    db.close();
    throw error;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--execute");
  const maxAgeDays = parseInt(
    args.find((arg) => arg.startsWith("--max-age="))?.split("=")[1] || "90",
    10
  );
  const keepMinimum = parseInt(
    args.find((arg) => arg.startsWith("--keep="))?.split("=")[1] || "100",
    10
  );

  console.log("🧹 Brain Database Pruning");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(`Max age: ${maxAgeDays} days`);
  console.log(`Keep minimum: ${keepMinimum} commits`);
  console.log("");

  const result = pruneOldData({
    dryRun,
    maxAgeDays,
    keepMinimum,
  });

  console.log("Results:");
  console.log(`  Commits before: ${result.stats.commits_before}`);
  console.log(`  Commits after: ${result.stats.commits_after}`);
  console.log(`  Solutions before: ${result.stats.solutions_before}`);
  console.log(`  Solutions after: ${result.stats.solutions_after}`);
  console.log(`  Deleted commits: ${result.stats.deleted.commits}`);
  console.log(`  Deleted solutions: ${result.stats.deleted.solutions}`);
  console.log("");
  console.log(result.message);
}
