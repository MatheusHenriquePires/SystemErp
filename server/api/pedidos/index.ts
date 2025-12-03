// server/api/pedidos/index.ts
import sql from '~/server/database'
import { defineEventHandler, getCookie, getQuery, createError } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // 1. Autenticação
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
  const payload = jwt.decode(cookie) as { empresa_id: number }

  // 2. Pegar filtro da URL (ex: ?status=ORCAMENTO)
  const query = getQuery(event)
  const statusFiltro = query.status as string

  try {
    // 3. Query Dinâmica
    // Se status for 'TODOS', traz tudo. Se não, filtra.
    const pedidos = await sql`
      SELECT 
        p.id, 
        p.cliente_nome, 
        p.data_criacao, 
        p.valor_total, 
        p.status
      FROM pedidos p
      WHERE p.empresa_id = ${payload.empresa_id}
      ${statusFiltro && statusFiltro !== 'TODOS' 
        ? sql`AND p.status = ${statusFiltro}` 
        : sql``}
      ORDER BY p.id DESC
    `

    return pedidos
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return []
  }
})