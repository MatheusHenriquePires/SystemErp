// server/database.ts
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL não está configurada no ambiente de produção.")
}
const sql = (globalThis as any).db || postgres(connectionString)
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).db = sql
}

export default sql // <--- EXPORT DEFAULT!