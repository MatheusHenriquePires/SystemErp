// server/database.ts
import postgres from 'postgres'

// Pega a URL do Easypanel (que está nas variáveis de ambiente)
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL não está configurada no ambiente de produção.")
}

// Cria uma única instância do driver postgres
// 'global' garante que não criamos conexões múltiplas desnecessárias
const sql = (globalThis as any).db || postgres(connectionString)

// Armazena a instância no objeto global (apenas em dev)
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).db = sql
}

export default sql

// Dica: para usar nas APIs, use:
// import sql from '~/server/database'
// const resultado = await sql`SELECT ...`