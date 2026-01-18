---
type: reference
agent_role: architect
context_depth: 5
required_knowledge: ["asanmod_core", "agent_protocols"]
last_audited: "2026-01-18"
---

# ASANMOD v3.2.0: Ghost-Dev Otonom Protokolü

> **KAPSAM:** AI Ajanlarının kullanıcı müdahalesi olmadan teknik karar verme ve uygulama sınırlarını belirler.

## 📌 1. Teknik Disiplin ve Otonomi Sınırları

Ghost-Dev modu aktif olduğunda, AI ajanı "Teknik Lider" rolünü üstlenir. Bu modda aşağıdaki kurallar kesindir:

- **Teknoloji Yığın Sabitliği:** Next.js 15, tRPC, Drizzle, Zod ve TailwindCSS dışına çıkılması kesinlikle yasaktır.
- **Sıfır Teknik İstişare:** Kütüphane seçimi, dosya yapısı veya algoritma detayı için kullanıcıya soru sorulmaz. Ajan, en verimli teknik yolu otonom olarak belirler ve uygular.
- **Mühürleme (State Locking):** Her kritik aşama sonunda `npm run verify` çalıştırılarak `0/0/0` (Sıfır hata/uyarı) durumu mühürlenir.

---

## 📋 2. Stratejik İlk Giriş (Interview Base)

Ajan, geliştirme sürecine başlamadan önce kullanıcıdan yalnızca aşağıdaki iş-mantığı (Business Logic) verilerini toplar:

1. **Proje Tanımı:** SaaS'ın temel amacı ve hedef kitlesi.
2. **Kritik İş Akışları:** Kullanıcının sistemde gerçekleştireceği ana aksiyonlar (Örn: "Müşteri oluşturma", "Rapor alma").
3. **Veri Modeli (Entities):** Takip edilecek ana veriler (Örn: "Projeler", "Faturalar", "Dosyalar").
4. **Entegrasyonlar:** Ödeme sistemi, Mail servisleri gibi dış bağımlılıklar.

Bu bilgiler alındıktan sonra teknik süreç tamamen otonomdur.

---

## ⚙️ 3. Otonom Geliştirme Hattı

Bilgi toplama sonrası ajan aşağıdaki adımları sırasıyla gerçekleştirir:

### A. Veri Mimarisi (`src/db/schema/`)
Veri varlıklarına göre tabloları ve ilişkilerini Drizzle formatında otonom olarak tanımlar.

### B. API Gateway (`src/server/routers/`)
İş akışlarına uygun tRPC router'larını ve Zod validasyonlarını oluşturur.

### C. UI/UX Implementasyonu (`src/app/`)
Tanımlanan yapıya uygun, responsive ve erişilebilir Next.js sayfalarını tasarlar.

---

## 🛡️ 4. Otonom Verifikasyon Yasaları

Ajan her işlemde şu fiziksel kısıtları uygular:

1. **Hata Yakalama:** Çıkan her hatayı önce `pm dev errors` ile kendisi analiz eder ve çözer.
2. **Kalite Kontrol:** Hiçbir kod bloğu `npm run verify` geçmeden commitlenmez.
3. **SSOT Sadakati:** Tüm port ve yol bilgileri `asanmod-core.json` üzerinden okunur.
4. **Token Ekonomisi:** Gereksiz teknik açıklamalardan kaçınılır, sadece sonuç raporlanır.

---

## 🔒 5. Aktivasyon ve Kapatma

Proje baseline'ı kurulduğunda:
1. `npm run status` ile sistem sağlığı doğrulanır.
2. Ajan kullanıcıya teknik detay vermeden "Baseline mühürlendi, otonom mod aktif." raporu verir.

---

*ASANMOD v3.2.0 | Otonom Operasyon Statüsü: Aktif*
