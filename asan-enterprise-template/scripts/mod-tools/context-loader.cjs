const fs = require("fs");
const path = require("path");

// ASANMOD v8.1 - CONTEXT LOADER (JIT)
// Usage: node context-loader.js "<error_message>"

const errorMsg = process.argv[2] || "";
const TRIGGER_MAP_PATH = path.join(
  __dirname,
  "../../docs/configurations/trigger_map.json"
);

if (!fs.existsSync(TRIGGER_MAP_PATH)) {
  console.log(JSON.stringify({ error: "Trigger map not found." }));
  process.exit(1);
}

try {
  const mapData = JSON.parse(fs.readFileSync(TRIGGER_MAP_PATH, "utf8"));
  const found = mapData.triggers.find((t) => errorMsg.includes(t.pattern));

  if (found) {
    console.log(
      JSON.stringify(
        {
          found: true,
          ki: found.ki,
          reason: found.reason,
          path: `knowledge/${found.ki}`, // Simplified path for Agent to find
        },
        null,
        2
      )
    );
  } else {
    console.log(
      JSON.stringify(
        {
          found: false,
          message: "No specific context trigger found for this error.",
        },
        null,
        2
      )
    );
  }
} catch (e) {
  console.log(JSON.stringify({ error: e.message }));
}
