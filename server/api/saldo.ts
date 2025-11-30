// server/api/saldo.ts
import postgres from 'postgres'

// Conexão com seu banco (pega do .env)
const sql = postgres(process.env.DATABASE_URL)

export default defineEventHandler(async (event) => {
  // Aqui você fará a query segura
  // Exemplo: Somar entradas - saídas da empresa do usuário
  const resultado = await sql`
    SELECT 
      (SELECT COALESCE(SUM(valor), 0) FROM receitas WHERE empresa_id = 1) - 
      (SELECT COALESCE(SUM(valor), 0) FROM despesas WHERE empresa_id = 1) 
    as saldo
  `
  
  return {
    saldoTotal: resultado[0].saldo
  }
})