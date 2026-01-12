/**
 * IKAI Brain System - Code Quality Rules
 * First-Time-Right System - Proactive Code Quality
 *
 * @module data/quality-rules
 * @version 2.2.0
 * @created 2025-12-15
 */

export interface QualityRule {
  id: string;
  name: string;
  category: "altin" | "zorunlu" | "onemli";
  priority: number;
  is_mandatory: boolean;
  description: string;
  content: string;
  keywords: string[];
}

export const QUALITY_RULES: QualityRule[] = [
  {
    id: "rule-0-first-time-right",
    name: "First-Time-Right",
    category: "altin",
    priority: 0,
    is_mandatory: true,
    description: "Kod ilk seferde dogru yazilmali, --no-verify YASAK",
    content: `
## First-Time-Right Kurali

### Ne Demek?
- Kod yazarken lint, prettier, TypeScript hatasi CIKARMAMALI
- \`--no-verify\` ile commit YASAK
- Hata cikarsa, bu kod kalitesi eksikligi demektir

### Kontrol Listesi
1. Yazmadan ONCE mevcut dosyanin stilini kontrol et
2. Template literal icinde escape karakter KULLANMA
3. Markdown syntax'i TypeScript'te farkli calisir
4. Her zaman \`npm run lint\` ile test et

### Anti-Pattern
\`\`\`bash
# YANLIS - Hata cikinca bypass
git commit --no-verify -m "fix: xyz"

# DOGRU - Hata duzelt, sonra commit
npm run lint
# 0 errors, 0 warnings
git commit -m "fix: xyz [MOD]"
\`\`\`
    `,
    keywords: ["first-time-right", "no-verify", "lint", "quality"],
  },
  {
    id: "rule-0-pre-write-check",
    name: "Pre-Write Validation",
    category: "altin",
    priority: 1,
    is_mandatory: true,
    description: "Kod yazmadan once mevcut stil kontrol edilmeli",
    content: `
## Pre-Write Validation

### Kod Yazmadan ONCE
1. Hedef dosyayi oku
2. Mevcut formatting'i analiz et:
   - Semicolon var mi?
   - Single quote mu double quote mu?
   - Trailing comma var mi?
   - Tab mi space mi?
3. Ayni stili uygula

### Prettier Ayarlari (Frontend)
- semi: true
- trailingComma: "es5"
- singleQuote: false
- printWidth: 80
- tabWidth: 2

### Prettier Ayarlari (Backend)
- semi: true
- trailingComma: "es5"
- singleQuote: false
- printWidth: 80
- tabWidth: 2
    `,
    keywords: ["pre-write", "validation", "prettier", "style"],
  },
  {
    id: "rule-0-template-literal-safety",
    name: "Template Literal Safety",
    category: "zorunlu",
    priority: 5,
    is_mandatory: true,
    description: "Template literal icinde escape karakter YASAK",
    content: `
## Template Literal Safety

### Problem
TypeScript/JavaScript template literal icinde bazi karakterler sorun cikarir:
- Escaped backtick -> SyntaxError
- Escaped asterisk -> no-useless-escape
- Escaped quote -> no-useless-escape

### DOGRU Kullanim
\`\`\`typescript
// Template literal icinde dogrudan kullan
const content = \`
  **Bold text** - Escape yok
  'Single quote' - Escape yok
  "Double quote" - Escape yok
\`;
\`\`\`

### YANLIS Kullanim
\`\`\`typescript
// ESLint hata verir: no-useless-escape
// Backslash asterisk gibi escape karakterler YANLIS
\`\`\`

### Markdown in TypeScript
Template literal icinde Markdown yazarken:
- **Bold**: \`**text**\` (escape YOK)
- *Italic*: \`*text*\` (escape YOK)
- Lists: \`- item\` (escape YOK)
    `,
    keywords: ["template-literal", "escape", "backtick", "markdown"],
  },
  {
    id: "rule-0-dry-run",
    name: "Dry-Run Before Commit",
    category: "zorunlu",
    priority: 6,
    is_mandatory: true,
    description: "npm run lint 0 hata olana kadar commit YASAK",
    content: `
## Dry-Run Before Commit

### Commit Oncesi ZORUNLU
\`\`\`bash
# Frontend icin
cd frontend && npm run lint
# CIKTI: 0 errors, 0 warnings OLMALI

# Backend icin
cd backend && npm run lint
# CIKTI: 0 errors, 0 warnings OLMALI
\`\`\`

### Hata Varsa
1. Commit YAPMA
2. Hatayi duzelt
3. Tekrar lint calistir
4. 0/0 olunca commit yap

### Pre-commit Hook
\`\`\`bash
# .git/hooks/pre-commit zaten bunu kontrol ediyor
# Ama agent olarak sen zaten lint kontrolu yapmalisin
\`\`\`
    `,
    keywords: ["dry-run", "lint", "commit", "zero-errors"],
  },
  {
    id: "rule-0-codebase-style",
    name: "Codebase Style Match",
    category: "zorunlu",
    priority: 7,
    is_mandatory: true,
    description: "Mevcut kod stiline uyum zorunlu",
    content: `
## Codebase Style Match

### Kurallar
1. Yeni kod, mevcut kodla AYNI stilde olmali
2. Import siralamasi mevcut dosyayla uyumlu olmali
3. Naming convention tutarli olmali

### Frontend (Next.js + TypeScript)
- React components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case veya PascalCase (component)

### Backend (Express + JavaScript)
- Controllers: camelCase
- Routes: kebab-case
- Services: camelCase
- Constants: UPPER_SNAKE_CASE
    `,
    keywords: ["codebase", "style", "naming", "convention"],
  },
  {
    id: "rule-0-escape-prevention",
    name: "Escape Character Prevention",
    category: "zorunlu",
    priority: 8,
    is_mandatory: true,
    description: "Gereksiz escape karakterleri YASAK",
    content: `
## Escape Character Prevention

### YASAK Escape'ler (no-useless-escape)
- Backslash asterisk -> * kullan
- Backslash quote -> ' kullan (template literal icinde)
- Backslash colon -> : kullan
- Backslash slash -> / kullan (regex disinda)

### IZINLI Escape'ler
- \\n -> newline
- \\t -> tab
- \\\\ -> literal backslash
- \\$ -> literal $ (template literal icinde)

### Regex'te Izinli
\`\`\`typescript
const regex = /\\./; // Dot escape - IZINLI
const regex2 = /\\*/; // Asterisk escape - IZINLI in regex
\`\`\`

### String'de YASAK
\`\`\`typescript
// YANLIS
const str = "*bold*"; // Bu dogru syntax

// DOGRU
const str = "*bold*";
\`\`\`
    `,
    keywords: ["escape", "useless-escape", "lint", "regex"],
  },
];

/**
 * Prettier settings for different contexts
 */
export const PRETTIER_SETTINGS = {
  frontend: {
    semi: true,
    trailingComma: "es5",
    singleQuote: false,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  },
  backend: {
    semi: true,
    trailingComma: "es5",
    singleQuote: false,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  },
};

/**
 * Common errors that the system should detect
 */
export const COMMON_CODE_QUALITY_ERRORS = [
  {
    pattern: "no-useless-escape",
    description: "Unnecessary escape character in string",
    fileTypes: ["ts", "tsx", "js", "jsx"],
    fix: "Remove the backslash before the character",
  },
  {
    pattern: "prettier/prettier",
    description: "Code style does not match Prettier rules",
    fileTypes: ["ts", "tsx", "js", "jsx", "json"],
    fix: "Run prettier --write on the file",
  },
  {
    pattern: "@typescript-eslint/no-unused-vars",
    description: "Variable is declared but never used",
    fileTypes: ["ts", "tsx"],
    fix: "Remove the unused variable or use it",
  },
  {
    pattern: "react-hooks/exhaustive-deps",
    description: "React hook dependencies missing",
    fileTypes: ["tsx", "jsx"],
    fix: "Add missing dependencies to the dependency array",
  },
  {
    pattern: "no-console",
    description: "Console statement found",
    fileTypes: ["ts", "tsx", "js", "jsx"],
    fix: "Remove console.log or use console.error/warn",
  },
];

/**
 * Pre-write checklist generator
 */
export function generatePreWriteChecklist(
  fileType: string,
  context: string
): string[] {
  const checklist: string[] = [];

  // Common checks
  checklist.push("Read target file to understand current style");
  checklist.push("Check .prettierrc for formatting rules");
  checklist.push("Check .eslintrc.json for linting rules");

  // Type-specific checks
  if (fileType === "tsx" || fileType === "jsx") {
    checklist.push("Check React component naming (PascalCase)");
    checklist.push("Check hook usage patterns");
    checklist.push("Verify responsive classes (sm:, md:, lg:)");
  }

  if (fileType === "ts" || fileType === "tsx") {
    checklist.push("Ensure proper TypeScript types");
    checklist.push("Check for any type usage (avoid any)");
  }

  // Context-specific checks
  if (context === "frontend") {
    checklist.push("semi: true, trailingComma: es5, singleQuote: false");
    checklist.push("Check import order consistency");
  } else if (context === "backend") {
    checklist.push("semi: true, trailingComma: es5");
    checklist.push("Check for proper error handling");
  }

  // Always add template literal warning
  checklist.push(
    "CRITICAL: NO escape characters in template literals (no backslash asterisk, etc.)"
  );

  return checklist;
}

/**
 * Get quality rules for a specific context
 */
export function getQualityRulesForContext(
  fileType: string,
  context: string
): QualityRule[] {
  // All quality rules apply to all contexts
  return QUALITY_RULES;
}

/**
 * Get common errors for a file type
 */
export function getCommonErrors(
  fileType: string,
  context: string
): typeof COMMON_CODE_QUALITY_ERRORS {
  return COMMON_CODE_QUALITY_ERRORS.filter((error) =>
    error.fileTypes.includes(fileType)
  );
}

export default {
  QUALITY_RULES,
  PRETTIER_SETTINGS,
  COMMON_CODE_QUALITY_ERRORS,
  generatePreWriteChecklist,
  getQualityRulesForContext,
  getCommonErrors,
};
