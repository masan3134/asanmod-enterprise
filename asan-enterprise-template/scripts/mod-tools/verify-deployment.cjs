#!/usr/bin/env node
/**
 * ASANMOD v5.0: VERIFY DEPLOYMENT
 * Post-deploy smoke test for production health checks.
 */
const https = require("https");
const http = require("http");

// Basit HTTP Request sarmalayıcısı (Dependency-free)
function checkUrl(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const req = protocol.get(url, { rejectUnauthorized: false }, (res) => {
      // Self-signed SSL desteği için rejectUnauthorized: false
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            resolve({ ok: true, data: json });
          } catch (e) {
            // JSON değilse bile status 200 ise OK sayabiliriz ama bizim health endpoint JSON dönmeli.
            resolve({ ok: true, data: data });
          }
        } else {
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

// Renkli çıktılar
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

async function verify() {
  console.log("🔍 Verifying Deployment Health...");

  const endpoints = [
    { name: "Frontend Internal", url: "http://localhost:8205/api/health" },
    { name: "Backend Internal", url: "http://localhost:8204/health" }, // Backend root /health
  ];

  let allPassed = true;

  for (const ep of endpoints) {
    try {
      const result = await checkUrl(ep.url);
      console.log(
        `${colors.green}✅ ${ep.name} (${ep.url}) - OK${colors.reset}`
      );
      // Opsiyonel: Dönen versiyonu kontrol et
    } catch (e) {
      console.error(
        `${colors.red}❌ ${ep.name} (${ep.url}) - FAILED: ${e.message}${colors.reset}`
      );
      allPassed = false;
    }
  }

  if (!allPassed) {
    console.error(
      `${colors.red}⚠️  SMOKE TEST FAILED. ROLLBACK ADVISED.${colors.reset}`
    );
    process.exit(1);
  } else {
    console.log(`${colors.green}🚀 ALL SYSTEMS OPERATIONAL${colors.reset}`);
    process.exit(0);
  }
}

verify();
