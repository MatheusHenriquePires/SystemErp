// server/api/vendas/index.ts
import sql from '~/server/database' // <-- Importação CORRETA do default export 'sql'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  // A DECODIFICAÇÃO DO COOKIE DEPENDE DO JWT
  const payload = jwt.decode(cookie) as { empresa_id: number }
  const empresa_id = payload.empresa_id

  try {
    // Usamos 'sql` diretamente, sem 'db.query'
    const result = await sql`
      SELECT 
        v.id, 
        v.data_venda, 
        v.valor_total, 
        v.status, 
        c.nome AS cliente_nome 
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE v.empresa_id = ${empresa_id}
      ORDER BY v.data_venda DESC
    `

    return result
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    throw createError({ statusCode: 500, message: 'Erro interno ao buscar vendas.' })
  }
})