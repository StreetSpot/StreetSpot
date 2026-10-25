import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(root, "supabase", "migrations");
const productionManifest = path.join(root, "supabase", "migration-history.production.txt");
const pendingManifest = path.join(root, "supabase", "migration-history.pending.txt");

const readVersions = async (file) => (await readFile(file, "utf8"))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

const productionVersions = await readVersions(productionManifest);
const pendingVersions = await readVersions(pendingManifest);
const names = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
const errors = [];
const fileByVersion = new Map();

for (const name of names) {
  const match = name.match(/^(\d{14})_.+\.sql$/);
  if (!match) {
    errors.push("Migration filename has no 14-digit version prefix: " + name);
    continue;
  }
  if (fileByVersion.has(match[1])) errors.push("Duplicate migration version: " + match[1]);
  fileByVersion.set(match[1], name);
}

for (const version of productionVersions) {
  if (!fileByVersion.has(version)) errors.push("Production migration missing from repository: " + version);
}
for (const version of pendingVersions) {
  if (!fileByVersion.has(version)) errors.push("Pending migration missing from repository: " + version);
}
const knownVersions = new Set([...productionVersions, ...pendingVersions]);
for (const version of fileByVersion.keys()) {
  if (!knownVersions.has(version)) errors.push("Migration version is neither production-applied nor explicitly pending: " + version);
}
for (const version of productionVersions) {
  if (pendingVersions.includes(version)) errors.push("Version cannot be both production-applied and pending: " + version);
}

const serviceOnlyTables = new Set([
  "public.event_hosting_purchases",
  "public.private_event_guest_drafts",
  "public.conversion_events",
  "private.stripe_webhook_config",
  "private.stripe_webhook_events",
]);

const hasTableRef = (statement, ref) => statement.toLowerCase().includes(ref.toLowerCase());

for (const name of names) {
  const sql = await readFile(path.join(migrationsDir, name), "utf8");
  const lowerSql = sql.toLowerCase();
  const creates = [...sql.matchAll(/\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?(?:(public|private)\s*\.\s*)?([a-z_][a-z0-9_$]*)/ig)];
  const grants = [...sql.matchAll(/\bgrant\b[\s\S]*?;/ig)].map((m) => m[0]);
  const revokes = [...sql.matchAll(/\brevoke\b[\s\S]*?;/ig)].map((m) => m[0]);

  for (const statement of grants) {
    const lower = statement.toLowerCase();
    if (lower.includes("public.community_spots")) {
      const target = lower.indexOf("on public.community_spots");
      const privilegePart = target >= 0 ? lower.slice(0, target) : "";
      const clientGrant = /\bto\b[\s\S]*\b(anon|authenticated)\b/i.test(lower);
      const columnScoped = /\b(select|insert|update|delete|references)\s*\(/i.test(privilegePart);
      if (clientGrant && !columnScoped) {
        errors.push(name + ": community_spots must never receive a blanket table-level grant to client roles.");
      }
      if (clientGrant && /\bclaimed_by\b|\bclaimed_at\b/i.test(lower)) {
        errors.push(name + ": community_spots claim-owner metadata must not be granted to client roles.");
      }
    }
  }

  for (const [, schema = "public", table] of creates) {
    const ref = schema.toLowerCase() + "." + table.toLowerCase();
    const tableGrants = grants.filter((statement) => hasTableRef(statement, ref));
    if (schema.toLowerCase() === "public" &&
        !lowerSql.includes("alter table " + ref + " enable row level security")) {
      errors.push(name + ": public table " + ref + " must enable RLS in its creation migration.");
    }
    if (serviceOnlyTables.has(ref)) {
      const hasServiceGrant = tableGrants.some((statement) =>
        /\bto\b[\s\S]*\bservice_role\b/i.test(statement));
      const hasClientRevocation = revokes.some((statement) => {
        if (!/\brevoke\s+all\b/i.test(statement) || !hasTableRef(statement, ref)) return false;
        const from = statement.match(/\bfrom\b([\s\S]*);/i)?.[1] ?? "";
        return /\bpublic\b/i.test(from) && /\banon\b/i.test(from) && /\bauthenticated\b/i.test(from);
      });
      if (!hasServiceGrant || !hasClientRevocation) {
        errors.push(name + ": " + ref + " is designated service-only and must explicitly revoke client access and grant service_role access in its creation migration.");
      }
    } else if (tableGrants.length === 0) {
      errors.push(name + ": " + ref + " has no explicit GRANT in its creation migration. Add least-privilege grants or classify it as service-only with explicit revocation.");
    }
  }
}

if (errors.length) {
  console.error("Migration safeguards failed:");
  for (const error of errors) console.error(" - " + error);
  process.exitCode = 1;
} else {
  console.log("Migration safeguards passed: " + names.length + " files, " +
    productionVersions.length + " production versions, " + pendingVersions.length +
    " pending version(s); each created table has an explicit access decision.");
}
