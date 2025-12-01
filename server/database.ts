// server/database.ts
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL não está configurada no ambiente de produção.")
}
// Cria uma instância única de conexão para todo o servidor Nitro
const sql = (globalThis as any).db || postgres(connectionString)
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).db = sql
}

export default sql // <--- Essa é a conexão que suas APIs devem importar