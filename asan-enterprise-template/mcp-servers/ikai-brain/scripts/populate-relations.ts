/**
 * Populate Brain Relations Table
 * Analyzes codebase for service → route → table relationships
 * Populates relations table for side-effect detection
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename, dirname } from "path";
import { fileURLToPath } from "url";
import {
  initDatabase,
  addRelation,
  addEntity,
  closeDatabase,
} from "../src/store/sqlite.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = process.env.PROJECT_ROOT || join(__dirname, "../../../..");
const BACKEND_ROUTES = join(PROJECT_ROOT, "backend/src/routes");
const BACKEND_SERVICES = join(PROJECT_ROOT, "backend/src/services");
const PRISMA_SCHEMA = join(PROJECT_ROOT, "backend/prisma/schema.prisma");
const FRONTEND_APP = join(PROJECT_ROOT, "frontend/app");

interface RouteInfo {
  name: string;
  path: string;
  methods: string[];
  service?: string;
}

interface ServiceInfo {
  name: string;
  path: string;
  routes: string[];
  tables: string[];
}

interface TableInfo {
  name: string;
  model: string;
}

/**
 * Extract route information from route file
 */
function extractRouteInfo(filePath: string): RouteInfo | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const fileName = basename(filePath, extname(filePath));

    // Extract route name from filename (e.g., userRoutes.js → user)
    const routeName = fileName.replace(/Routes?\.(js|ts)$/i, "");

    // Extract HTTP methods
    const methods: string[] = [];
    if (content.includes(".get(")) methods.push("GET");
    if (content.includes(".post(")) methods.push("POST");
    if (content.includes(".put(")) methods.push("PUT");
    if (content.includes(".patch(")) methods.push("PATCH");
    if (content.includes(".delete(")) methods.push("DELETE");

    // Extract service name (look for require/import)
    let service: string | undefined;
    const serviceMatch = content.match(
      /(?:require|import).*['"](.*[Ss]ervice)['"]/
    );
    if (serviceMatch) {
      service = serviceMatch[1]
        .replace(/.*\/([^/]+)$/, "$1")
        .replace(/Service\.(js|ts)$/i, "");
    }

    return {
      name: routeName,
      path: filePath,
      methods: methods.length > 0 ? methods : ["GET", "POST", "PUT", "DELETE"],
      service,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extract service information from service file
 */
function extractServiceInfo(filePath: string): ServiceInfo | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const fileName = basename(filePath, extname(filePath));
    const serviceName = fileName.replace(/Service\.(js|ts)$/i, "");

    // Extract Prisma model usage
    const tables: string[] = [];
    const prismaMatches = content.matchAll(/prisma\.(\w+)\./g);
    for (const match of prismaMatches) {
      if (match[1] && !tables.includes(match[1])) {
        tables.push(match[1]);
      }
    }

    return {
      name: serviceName,
      path: filePath,
      routes: [],
      tables,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extract table information from Prisma schema
 */
function extractTablesFromSchema(): TableInfo[] {
  try {
    const content = readFileSync(PRISMA_SCHEMA, "utf-8");
    const tables: TableInfo[] = [];

    // Match model definitions
    const modelRegex = /model\s+(\w+)\s*\{/g;
    let match;
    while ((match = modelRegex.exec(content)) !== null) {
      tables.push({
        name: match[1],
        model: match[1],
      });
    }

    return tables;
  } catch (error) {
    console.error("Error reading Prisma schema:", error);
    return [];
  }
}

/**
 * Scan directory for files
 */
function scanDirectory(dir: string, extension: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath, extension));
      } else if (extname(entry) === extension) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }

  return files;
}

/**
 * Main population function
 */
async function populateRelations() {
  console.log("🔍 Starting relations population...");

  // Initialize database
  initDatabase();

  let relationCount = 0;

  // 1. Extract routes
  console.log("📁 Scanning routes...");
  const routeFiles = scanDirectory(BACKEND_ROUTES, ".js");
  const routes: RouteInfo[] = [];

  for (const file of routeFiles) {
    const routeInfo = extractRouteInfo(file);
    if (routeInfo) {
      routes.push(routeInfo);
      // Create entity for route
      addEntity({
        id: `route:${routeInfo.name}`,
        name: routeInfo.name,
        entity_type: "route",
        description: `Route: ${routeInfo.name}`,
      });
    }
  }

  console.log(`  Found ${routes.length} routes`);

  // 2. Extract services
  console.log("📁 Scanning services...");
  const serviceFiles = scanDirectory(BACKEND_SERVICES, ".js");
  const services: ServiceInfo[] = [];

  for (const file of serviceFiles) {
    const serviceInfo = extractServiceInfo(file);
    if (serviceInfo) {
      services.push(serviceInfo);
      // Create entity for service
      addEntity({
        id: `service:${serviceInfo.name}`,
        name: serviceInfo.name,
        entity_type: "service",
        description: `Service: ${serviceInfo.name}`,
      });
    }
  }

  console.log(`  Found ${services.length} services`);

  // 3. Extract tables from Prisma schema
  console.log("📁 Scanning Prisma schema...");
  const tables = extractTablesFromSchema();

  for (const table of tables) {
    // Create entity for table
    addEntity({
      id: `table:${table.name}`,
      name: table.name,
      entity_type: "table",
      description: `Database table: ${table.name}`,
    });
  }

  console.log(`  Found ${tables.length} tables`);

  // 4. Create SERVICE_ROUTE relations
  console.log("🔗 Creating SERVICE_ROUTE relations...");
  for (const route of routes) {
    if (route.service) {
      const service = services.find(
        (s) => s.name.toLowerCase() === route.service?.toLowerCase()
      );
      if (service) {
        addRelation({
          from_entity: `service:${service.name}`,
          to_entity: `route:${route.name}`,
          relation_type: "SERVICE_ROUTE",
          strength: 1.0,
        });
        relationCount++;
      }
    }
  }

  // 5. Create ROUTE_TABLE relations (via service)
  console.log("🔗 Creating ROUTE_TABLE relations...");
  for (const route of routes) {
    if (route.service) {
      const service = services.find(
        (s) => s.name.toLowerCase() === route.service?.toLowerCase()
      );
      if (service) {
        for (const tableName of service.tables) {
          const table = tables.find((t) => t.name === tableName);
          if (table) {
            addRelation({
              from_entity: `route:${route.name}`,
              to_entity: `table:${table.name}`,
              relation_type: "ROUTE_TABLE",
              strength: 0.8, // Indirect relation
            });
            relationCount++;
          }
        }
      }
    }
  }

  // 6. Create SERVICE_TABLE relations
  console.log("🔗 Creating SERVICE_TABLE relations...");
  for (const service of services) {
    for (const tableName of service.tables) {
      const table = tables.find((t) => t.name === tableName);
      if (table) {
        addRelation({
          from_entity: `service:${service.name}`,
          to_entity: `table:${table.name}`,
          relation_type: "SERVICE_TABLE",
          strength: 1.0,
        });
        relationCount++;
      }
    }
  }

  // 7. Scan frontend for component → service mappings (simplified)
  console.log("📁 Scanning frontend components...");
  const componentFiles = scanDirectory(FRONTEND_APP, ".tsx");
  let componentCount = 0;

  for (const file of componentFiles.slice(0, 50)) {
    // Limit to first 50 for performance
    try {
      const content = readFileSync(file, "utf-8");
      // Look for API service imports
      const apiMatches = content.matchAll(
        /(?:import|from).*['"](.*\/api\/.*|.*Service)['"]/g
      );
      for (const match of apiMatches) {
        const servicePath = match[1];
        const serviceName =
          servicePath
            .split("/")
            .pop()
            ?.replace(/\.(js|ts)$/i, "") || "";

        if (serviceName) {
          const componentName = basename(file, extname(file));
          // Create entity for component
          addEntity({
            id: `component:${componentName}`,
            name: componentName,
            entity_type: "component",
            description: `React component: ${componentName}`,
          });

          // Try to match with backend service
          const service = services.find(
            (s) =>
              s.name.toLowerCase().includes(serviceName.toLowerCase()) ||
              serviceName.toLowerCase().includes(s.name.toLowerCase())
          );

          if (service) {
            addRelation({
              from_entity: `component:${componentName}`,
              to_entity: `service:${service.name}`,
              relation_type: "COMPONENT_SERVICE",
              strength: 0.7,
            });
            relationCount++;
          }

          componentCount++;
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  console.log(`  Scanned ${componentCount} components`);

  // 8. Create RULE_APPLIES_TO relations (from existing rules)
  console.log("🔗 Creating RULE_APPLIES_TO relations...");
  const ruleFilePatterns: Record<string, string[]> = {
    "rule-2-rbac": [".prisma", "service", "route"],
    "rule-6-isolation": [".prisma", ".env"],
    "rule-0-pagespeed-seo-quality": [".tsx", ".jsx", "component"],
    "rule-0-lint-quality": [".ts", ".js", ".tsx", ".jsx"],
  };

  for (const [ruleId, patterns] of Object.entries(ruleFilePatterns)) {
    for (const pattern of patterns) {
      // Create relation for rule → file pattern
      addRelation({
        from_entity: ruleId,
        to_entity: `pattern:${pattern}`,
        relation_type: "RULE_APPLIES_TO",
        strength: 1.0,
      });
      relationCount++;
    }
  }

  console.log(`✅ Relations population complete!`);
  console.log(`   Total relations created: ${relationCount}`);

  closeDatabase();
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, "/") || "")) {
  populateRelations().catch(console.error);
}

export { populateRelations };
