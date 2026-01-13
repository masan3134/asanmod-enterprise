/**
 * ASANMOD v5.0: DEPLOY CONFIG
 * Centralized deployment configuration for all environments.
 */
module.exports = {
  // Ortak Konfigürasyon
  project: {
    name: "ikai-hr-platform",
    root: "/home/root/projects/ikaicursor",
    repo: "https://github.com/masan3134/ikaicursor.git", // Örnek
    timezone: "Europe/Istanbul",
  },

  // Ortam Bazlı Kurallar
  environments: {
    prod: {
      url: "https://ikai.com.tr",
      port_frontend: 8205,
      port_backend: 8204,
      pm2_frontend: "ikai-prod-frontend",
      pm2_backend: "ikai-prod-backend",

      // Güvenlik Kuralları
      allowed_branches: ["main", "master", "release/*"],
      require_confirmation: true, // Kullanıcı onayı ŞART
      require_clean_build: true, // Her zaman temiz build
      require_tests: true, // Unit testler geçmek ZORUNDA

      // Rollback Stratejisi
      auto_rollback: true, // Fail olursa otomatik geri al
      backup_db: true, // Deploy öncesi DB yedeği al

      // Build Yolları
      dist_dir: ".next-prod",
      env_file: ".env.prod",
    },

    dev: {
      url: "https://84.247.136.34:8203", // Örnek/Varsayılan
      port_frontend: 3000,
      port_backend: 3001,
      pm2_frontend: "ikai-dev-frontend",
      pm2_backend: "ikai-dev-backend",

      // Esnek Kurallar
      allowed_branches: ["*"], // Her branch serbest
      require_confirmation: false, // Hızlı deploy
      require_clean_build: false, // Cache kullanabilir
      require_tests: false, // Testler opsiyonel (hız için)

      auto_rollback: false,
      backup_db: false,

      dist_dir: ".next-dev",
      env_file: ".env.dev",
    },
  },

  // Health Check Rotaları
  health_checks: {
    frontend: "/api/health", // Yeni eklediğimiz
    backend: "/health", // Mevcut olan (dikkat: /api/v1/health değil, root'ta)
  },
};
