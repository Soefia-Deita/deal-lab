import "server-only";
import { neon } from "@neondatabase/serverless";
import type { ProofPack } from "./types";
import { buildDemoPack, DEMO_PACK_ID } from "./pack";

// Use Neon when a connection string is present (Vercel injects DATABASE_URL /
// POSTGRES_URL once you attach the Neon integration). Otherwise fall back to an
// in-memory store for local dev — works within one running server, NOT durable
// and NOT safe across serverless instances, so production must have the DB.
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = url ? neon(url) : null;

const mem = new Map<string, ProofPack>();
let warned = false;
function memWarn() {
  if (!warned) {
    warned = true;
    console.warn(
      "[db] No DATABASE_URL — using in-memory store (dev only; not durable, not multi-instance)."
    );
  }
}

let schemaReady: Promise<unknown> | null = null;
function ensureSchema() {
  if (!sql) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS proof_packs (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  }
  return schemaReady;
}

/** Seed the sample pack once if it isn't there yet. */
export async function ensureDemo(): Promise<void> {
  const demo = buildDemoPack();
  if (sql) {
    await ensureSchema();
    await sql`
      INSERT INTO proof_packs (id, data, created_at)
      VALUES (${DEMO_PACK_ID}, ${JSON.stringify(demo)}::jsonb, ${demo.createdAt})
      ON CONFLICT (id) DO NOTHING
    `;
  } else {
    memWarn();
    if (!mem.has(DEMO_PACK_ID)) mem.set(DEMO_PACK_ID, demo);
  }
}

export async function getPack(id: string): Promise<ProofPack | null> {
  await ensureDemo();
  if (sql) {
    const rows = (await sql`SELECT data FROM proof_packs WHERE id = ${id}`) as { data: ProofPack }[];
    return rows[0]?.data ?? null;
  }
  return mem.get(id) ?? null;
}

export async function listPacks(): Promise<ProofPack[]> {
  await ensureDemo();
  if (sql) {
    const rows = (await sql`
      SELECT data FROM proof_packs ORDER BY created_at DESC LIMIT 30
    `) as { data: ProofPack }[];
    return rows.map((r) => r.data);
  }
  return [...mem.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Insert a new pack (used on create). */
export async function insertPack(pack: ProofPack): Promise<void> {
  if (sql) {
    await ensureSchema();
    await sql`
      INSERT INTO proof_packs (id, data, created_at)
      VALUES (${pack.id}, ${JSON.stringify(pack)}::jsonb, ${pack.createdAt})
    `;
  } else {
    memWarn();
    mem.set(pack.id, pack);
  }
}

/** Upsert an existing pack (used on every mutation). */
export async function savePack(pack: ProofPack): Promise<void> {
  if (sql) {
    await ensureSchema();
    await sql`
      INSERT INTO proof_packs (id, data, created_at)
      VALUES (${pack.id}, ${JSON.stringify(pack)}::jsonb, ${pack.createdAt})
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `;
  } else {
    memWarn();
    mem.set(pack.id, pack);
  }
}
