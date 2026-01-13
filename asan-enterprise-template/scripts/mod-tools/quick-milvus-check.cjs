#!/usr/bin/env node
/**
 * ASANMOD v5.0: QUICK MILVUS CHECK
 * Standalone Milvus connection check - No project dependencies.
 */
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

async function checkCollection() {
  console.log("🔍 Checking Milvus collection: ikai_documentation");

  const client = new MilvusClient({
    address: "127.0.0.1:19530",
    token: "", // No token for local/dev usually
  });

  try {
    const hasCollection = await client.hasCollection({
      collection_name: "ikai_documentation",
    });

    if (!hasCollection.value) {
      console.log("❌ Collection 'ikai_documentation' DOES NOT EXIST.");
      return;
    }

    console.log("✅ Collection 'ikai_documentation' exists.");

    const stats = await client.getCollectionStatistics({
      collection_name: "ikai_documentation",
    });
    console.log("📊 Stats:", stats.stats);

    const count = await client.query({
      collection_name: "ikai_documentation",
      expr: "doc_id != ''",
      output_fields: ["count(*)"],
      limit: 1, // Just need a quick check if ANY data exists
    });

    // Note: 'query' behavior varies by SDK version, simpler to just check stats usually
    // but stats.row_count is reliable.

    const rowCountEntry = stats.stats.find((s) => s.key === "row_count");
    if (rowCountEntry) {
      console.log(`📈 Total Documents (Row Count): ${rowCountEntry.value}`);
      if (rowCountEntry.value === "0") {
        console.log("⚠️ Collection exists but is EMPTY.");
      } else {
        console.log("✅ Collection has data.");
      }
    }
  } catch (error) {
    console.error("🚨 Error connecting to Milvus:", error.message);
  } finally {
    await client.closeConnection();
  }
}

checkCollection();
