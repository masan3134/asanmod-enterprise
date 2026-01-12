# 🚀 ASANMOD v1.0.0 | Enterprise Template Quick Ref

> **SINGLE SOURCE OF TRUTH FOR AGENTS WORKING ON THIS PROJECT.**

## 🛡️ HARD CONSTRAINTS

- **0/0/0 Discipline:** Sıfır Lint, Sıfır Tip Hatası, Sıfır Log Kirliliği.
- **Physical Barriers:** `asan verify` geçmeden commit/deploy yapılamaz.
- **Mobile First:** Tailwind kullanırken responsive prefixler (`sm:`, `md:`, `lg:`) zorunludur.

## 🏗️ TECH STACK & PORTS

- **Frontend/Backend:** Next.js 15 (App Router) -> Port 3000
- **Bridge:** tRPC v11
- **ORM:** Drizzle (PostgreSQL)
- **Validation:** Zod

## 📂 CRITICAL PATHS

- `src/app/`: Next.js Routes & Pages
- `src/server/`: tRPC Routers & Business Logic
- `src/db/schema.ts`: Drizzle Schema Definitions
- `src/components/`: UI Components (Shadcn)
- `scripts/mod-tools/`: ASANMOD Governance Scripts

## ⚡ CORE COMMANDS

```bash
# Geliştirme Ortamı
npm run dev          # Sunucuyu başlat

# Doğrulama & Kalite
asan verify          # Full Check (Lint + TSC + State)
asan status          # Sistem durumunu göster

# Veritabanı
npm run db:generate  # Şema değişikliklerini algıla
npm run db:migrate   # Değişiklikleri uygula
```

## 🧠 AGENT GUIDELINES

1. **Always Type-Safe:** `any` kullanma. Zod şemalarını mürşid edin.
2. **Atomic Actions:** Büyük değişiklikleri parçalara böl ve her parçada `asan verify` çalıştır.
3. **No Placeholders:** Gerçek veri ve gerçek logic kullan.

---

_Generated: 2026-01-13 | ASANMOD v1.0.0 Ready._
