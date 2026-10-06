import { Pool } from "pg";
import { config } from "@/server/config";

// En desarrollo, Next recarga módulos (HMR): se guarda el pool en globalThis
// para no abrir una conexión nueva en cada recarga.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export function getPool(): Pool {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({ connectionString: config.databaseUrl });
  }
  return globalForPg.pgPool;
}

/** pgvector espera los vectores como texto: "[0.1,0.2,...]". */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
