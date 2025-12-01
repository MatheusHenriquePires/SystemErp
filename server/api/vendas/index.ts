import { Database } from '~~/server/database'
import { defineEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const payload = jwt.decode(cookie) as { empresa_id: number }
  const empresa_id = payload.empresa_id

  const db = new Database()

  try {
    const result = await db.query(
      `
      SELECT 
        v.id, 
        v.data_venda, 
        v.valor_total, 
        v.status, 
        c.nome AS cliente_nome  -- Junta com a tabela de clientes para pegar o nome
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE v.empresa_id = $1
      ORDER BY v.data_venda DESC
      `,
      [empresa_id]
    )

    return result.rows

  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    throw createError({ statusCode: 500, message: 'Erro interno ao buscar vendas.' })
  }
})