import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Changelog oluşturma tool'u
 * "cl oluştur" komutu için ASANMOD entegrasyonu
 */
export async function createChangelog(params: {
  date?: string; // YYYY-MM-DD formatında (opsiyonel, default: bugün)
  overwrite?: boolean; // Mevcut changelog'u üzerine yaz (default: false)
  path?: string; // Kontrol edilecek path (opsiyonel)
}): Promise<{
  success: boolean;
  changelogFile?: string;
  version?: string;
  commitCount?: number;
  firstCommit?: string;
  lastCommit?: string;
  message: string;
}> {
  const { date, overwrite = false, path = "." } = params;

  try {
    const projectRoot = process.cwd();
    const changelogsDir = join(projectRoot, "docs", "changelogs");
    const targetDate = date || new Date().toISOString().split("T")[0];
    const changelogFile = join(changelogsDir, `CHANGELOG-${targetDate}.md`);

    // Changelog zaten varsa ve overwrite false ise
    if (existsSync(changelogFile) && !overwrite) {
      return {
        success: false,
        changelogFile,
        message: `Changelog zaten mevcut: ${changelogFile}. Overwrite için overwrite: true kullanın.`,
      };
    }

    // Son changelog'u bul ve son commit hash'ini al
    const lastChangelog = execSync(
      `ls -t ${changelogsDir}/CHANGELOG-*.md 2>/dev/null | grep -v "COMPLETE\\|v1.2.3" | head -1 || echo ""`,
      { encoding: "utf-8", cwd: projectRoot }
    ).trim();

    let lastCommitHash = "";
    if (lastChangelog && existsSync(lastChangelog)) {
      const lastChangelogContent = readFileSync(lastChangelog, "utf-8");
      // Son commit hash'ini bul (Son Commit: `hash` formatında)
      const lastCommitMatch = lastChangelogContent.match(
        /Son Commit[^`]*`([a-f0-9]+)`/i
      );
      if (lastCommitMatch) {
        lastCommitHash = lastCommitMatch[1];
      }
    }

    // Git commit'lerini al
    let gitCommand = "";
    if (!date && lastCommitHash) {
      // ✅ "cl oluştur" komutu: Tarih belirtilmemişse ve son changelog varsa, son commit'ten sonraki TÜM commit'leri al
      gitCommand = `git log ${lastCommitHash}..HEAD --format="%h|%s|%ci|%an" --no-merges`;
    } else if (date) {
      // Tarih belirtilmişse, o tarihteki commit'leri al
      gitCommand = `git log --since="${targetDate} 00:00:00" --until="${targetDate} 23:59:59" --format="%h|%s|%ci|%an" --no-merges`;
    } else {
      // Hiç changelog yoksa, bugünün commit'lerini al
      gitCommand = `git log --since="${targetDate} 00:00:00" --until="${targetDate} 23:59:59" --format="%h|%s|%ci|%an" --no-merges`;
    }

    const commits = execSync(gitCommand, {
      encoding: "utf-8",
      cwd: projectRoot,
    }).trim();

    if (!commits) {
      return {
        success: false,
        message: `Belirtilen tarih için commit bulunamadı: ${targetDate}`,
      };
    }

    const commitLines = commits.split("\n").filter((line) => line.trim());
    const commitCount = commitLines.length;
    const firstCommit =
      commitLines[commitLines.length - 1]?.split("|")[0] || "";
    const lastCommit = commitLines[0]?.split("|")[0] || "";

    // Son version'ı bul
    let lastVersion = "1.2.20";
    if (lastChangelog && existsSync(lastChangelog)) {
      const lastChangelogContent = readFileSync(lastChangelog, "utf-8");
      const versionMatch = lastChangelogContent.match(/^## \[([\d.]+)\]/m);
      if (versionMatch) {
        lastVersion = versionMatch[1];
      }
    }

    // Version'ı artır (patch increment)
    const [major, minor, patch] = lastVersion.split(".").map(Number);
    const nextVersion = `${major}.${minor}.${patch + 1}`;

    // Commit'leri kategorize et
    const categories: {
      added: Array<{ hash: string; message: string; module?: string }>;
      fixed: Array<{ hash: string; message: string; module?: string }>;
      changed: Array<{ hash: string; message: string; module?: string }>;
      documentation: Array<{ hash: string; message: string; module?: string }>;
      security: Array<{ hash: string; message: string; module?: string }>;
      removed: Array<{ hash: string; message: string; module?: string }>;
    } = {
      added: [],
      fixed: [],
      changed: [],
      documentation: [],
      security: [],
      removed: [],
    };

    commitLines.forEach((line) => {
      const [hash, message, datetime, author] = line.split("|");
      const cleanMessage = message.trim();

      // Module çıkar (feat(module): description)
      const moduleMatch = cleanMessage.match(/^(\w+)\(([^)]+)\):/);
      const module = moduleMatch ? moduleMatch[2] : undefined;
      const type = moduleMatch ? moduleMatch[1] : "";

      // Kategorize et
      if (type === "feat" || cleanMessage.toLowerCase().includes("feature")) {
        categories.added.push({ hash, message: cleanMessage, module });
      } else if (type === "fix" || cleanMessage.toLowerCase().includes("fix")) {
        categories.fixed.push({ hash, message: cleanMessage, module });
      } else if (
        type === "refactor" ||
        type === "chore" ||
        cleanMessage.toLowerCase().includes("refactor") ||
        cleanMessage.toLowerCase().includes("chore")
      ) {
        categories.changed.push({ hash, message: cleanMessage, module });
      } else if (
        type === "docs" ||
        cleanMessage.toLowerCase().includes("doc")
      ) {
        categories.documentation.push({ hash, message: cleanMessage, module });
      } else if (cleanMessage.toLowerCase().includes("security")) {
        categories.security.push({ hash, message: cleanMessage, module });
      } else if (
        cleanMessage.toLowerCase().includes("remove") ||
        cleanMessage.toLowerCase().includes("delete")
      ) {
        categories.removed.push({ hash, message: cleanMessage, module });
      } else {
        categories.changed.push({ hash, message: cleanMessage, module });
      }
    });

    // Modül bazlı gruplama
    const groupByModule = (
      items: Array<{ hash: string; message: string; module?: string }>
    ) => {
      const grouped: Record<
        string,
        Array<{ hash: string; message: string }>
      > = {};
      items.forEach((item) => {
        const module = item.module || "Other";
        if (!grouped[module]) {
          grouped[module] = [];
        }
        grouped[module].push({ hash: item.hash, message: item.message });
      });
      return grouped;
    };

    // Changelog içeriğini oluştur
    let changelogContent = `# IKAI HR Platform - Changelog

All notable changes to the IKAI HR Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [${nextVersion}] - ${targetDate}

`;

    // Added
    if (categories.added.length > 0) {
      changelogContent += `### ✨ Added

`;
      const grouped = groupByModule(categories.added);
      Object.keys(grouped).forEach((module) => {
        changelogContent += `#### ${module.charAt(0).toUpperCase() + module.slice(1)} Module

`;
        grouped[module].forEach((item) => {
          const description = item.message
            .replace(/^[^(]*\([^)]*\):\s*/, "")
            .replace(/\s*\[MOD\]|\s*\[W[1-6]\]/g, "")
            .trim();
          changelogContent += `- **${description}** (${item.hash})

`;
        });
      });
    }

    // Fixed
    if (categories.fixed.length > 0) {
      changelogContent += `### 🔧 Fixed

`;
      const grouped = groupByModule(categories.fixed);
      Object.keys(grouped).forEach((module) => {
        changelogContent += `#### ${module.charAt(0).toUpperCase() + module.slice(1)} Module

`;
        grouped[module].forEach((item) => {
          const description = item.message
            .replace(/^[^(]*\([^)]*\):\s*/, "")
            .replace(/\s*\[MOD\]|\s*\[W[1-6]\]/g, "")
            .trim();
          changelogContent += `- **${description}** (${item.hash})

`;
        });
      });
    }

    // Changed
    if (categories.changed.length > 0) {
      changelogContent += `### 🔄 Changed

`;
      const grouped = groupByModule(categories.changed);
      Object.keys(grouped).forEach((module) => {
        changelogContent += `#### ${module.charAt(0).toUpperCase() + module.slice(1)} Module

`;
        grouped[module].forEach((item) => {
          const description = item.message
            .replace(/^[^(]*\([^)]*\):\s*/, "")
            .replace(/\s*\[MOD\]|\s*\[W[1-6]\]/g, "")
            .trim();
          changelogContent += `- **${description}** (${item.hash})

`;
        });
      });
    }

    // Documentation
    if (categories.documentation.length > 0) {
      changelogContent += `### 📚 Documentation

`;
      const grouped = groupByModule(categories.documentation);
      Object.keys(grouped).forEach((module) => {
        changelogContent += `#### ${module.charAt(0).toUpperCase() + module.slice(1)} Module

`;
        grouped[module].forEach((item) => {
          const description = item.message
            .replace(/^[^(]*\([^)]*\):\s*/, "")
            .replace(/\s*\[MOD\]|\s*\[W[1-6]\]/g, "")
            .trim();
          changelogContent += `- **${description}** (${item.hash})

`;
        });
      });
    }

    // Security
    if (categories.security.length > 0) {
      changelogContent += `### 🔒 Security

`;
      const grouped = groupByModule(categories.security);
      Object.keys(grouped).forEach((module) => {
        changelogContent += `#### ${module.charAt(0).toUpperCase() + module.slice(1)} Module

`;
        grouped[module].forEach((item) => {
          const description = item.message
            .replace(/^[^(]*\([^)]*\):\s*/, "")
            .replace(/\s*\[MOD\]|\s*\[W[1-6]\]/g, "")
            .trim();
          changelogContent += `- **${description}** (${item.hash})

`;
        });
      });
    }

    // Removed
    if (categories.removed.length > 0) {
      changelogContent += `### 🗑️ Removed

`;
      const grouped = groupByModule(categories.removed);
      Object.keys(grouped).forEach((module) => {
        changelogContent += `#### ${module.charAt(0).toUpperCase() + module.slice(1)} Module

`;
        grouped[module].forEach((item) => {
          const description = item.message
            .replace(/^[^(]*\([^)]*\):\s*/, "")
            .replace(/\s*\[MOD\]|\s*\[W[1-6]\]/g, "")
            .trim();
          changelogContent += `- **${description}** (${item.hash})

`;
        });
      });
    }

    // Footer
    changelogContent += `---

## 📊 Özet

**Toplam Commit:** ${commitCount}
**Tarih:** ${targetDate}
**Version:** ${nextVersion}
**Tag:** v${nextVersion}

**Commit Range:**
- **İlk Commit:** \`${firstCommit}\`
- **Son Commit:** \`${lastCommit}\`

**Referans:** ASANMOD v2.1 - Master Coordinator System
`;

    // Changelog dosyasını yaz
    writeFileSync(changelogFile, changelogContent, "utf-8");

    return {
      success: true,
      changelogFile,
      version: nextVersion,
      commitCount,
      firstCommit,
      lastCommit,
      message: `Changelog başarıyla oluşturuldu: ${changelogFile}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Changelog oluşturma hatası: ${error.message}`,
    };
  }
}
