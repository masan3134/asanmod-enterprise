# 🚀 ASANMOD Ayrı Repo Oluşturma Kılavuzu

## ✅ Yapılanlar

1. **Dizin Oluşturuldu**: `asanmod-distribution/`
2. **Dosyalar Kopyalandı**:
   - `asan-enterprise-template/` (Template)
   - `asanmod-cli/` (CLI Tools)
   - `install.sh` (One-command installer)
3. **Yeni README**: Standalone açıklama
4. **package.json**: Distribution metadata
5. **.gitignore**: Clean repo için

---

## 📋 GitHub'a Push Adımları

### 1. GitHub'da Yeni Repo Oluştur

- Repo adı: `asanmod-enterprise`
- Description: "ASANMOD v1.0.0 - Enterprise SaaS Template for Autonomous AI Development"
- Public/Private seçimi (tercihinize göre)
- **ÖNEMLİ**: README veya .gitignore ekleme, boş repo oluştur

### 2. Lokal Git Başlatma

```bash
cd /home/root/projects/ikaicursor/asanmod-distribution
git init
git add .
git commit -m "Initial commit: ASANMOD v1.0.0 Enterprise Template"
```

### 3. GitHub'a Bağlama ve Push

```bash
# Remote ekle (YOUR_USERNAME'i değiştir)
git remote add origin https://github.com/YOUR_USERNAME/asanmod-enterprise.git

# Main branch oluştur ve push et
git branch -M main
git push -u origin main
```

### 4. Install Script URL Güncelle

Push yaptıktan sonra `install.sh` içindeki repo URL'ini güncelle:

```bash
# Eski:
git clone https://github.com/masan3134/ikaicursor.git

# Yeni:
git clone https://github.com/YOUR_USERNAME/asanmod-enterprise.git
```

---

## 🎯 Kullanım (Push Sonrası)

### Agent'a Vereceğiniz Komut

```bash
# Tek komut kurulum:
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/asanmod-enterprise/main/install.sh | bash

# Veya manuel:
git clone https://github.com/YOUR_USERNAME/asanmod-enterprise.git my-project
cd my-project/asan-enterprise-template
npm install
node scripts/mod-tools/asan-init.js
```

---

## ✅ Kontrol Listesi

- [x] Distribution klasörü oluşturuldu
- [x] Template ve CLI kopyalandı
- [x] README hazır
- [x] .gitignore hazır
- [ ] GitHub repo oluşturuldu
- [ ] Git init + commit
- [ ] GitHub'a push edildi
- [ ] install.sh URL'leri güncellendi
- [ ] Test edildi

---

## 🔐 IKAI Repo Güvenliği

**ÖNEMLİ**: Bu işlem IKAI repo'sunu etkilemez çünkü:

- Ayrı dizinde (`asanmod-distribution/`)
- Ayrı git init yapılacak
- Farklı remote URL
- IKAI repo'su dokunulmadan kalıyor

---

## 🚀 Son Adımlar

1. GitHub'da repo oluştur
2. Yukarıdaki git komutlarını çalıştır
3. Push sonrası install.sh'yi güncelle
4. Test et: `curl ... | bash`

---

**ASANMOD v1.0.0 | Distribution Ready**
