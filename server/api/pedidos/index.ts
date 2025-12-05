import sql from '~/server/database'
import { defineEventHandler, getCookie, getQuery, createError, readBody } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
  
  // Decodifica o token para pegar o ID de quem está logado AGORA
  const payload = jwt.decode(cookie) as { id: number, nome: string, empresa_id: number }

  const method = event.node.req.method

  // --- GET: LISTAR PEDIDOS ---
  if (method === 'GET') {
    const query = getQuery(event)
    const statusFiltro = query.status as string

    try {
      // JOIN DUPLO:
      // 1. Traz o nome do vendedor original (tabela usuarios -> u_vend)
      // 2. Traz o nome de quem editou por último (tabela usuarios -> u_edit)
      const pedidos = await sql`
        SELECT 
          p.*,
          p.cliente_nome,
          u_vend.nome as vendedor_nome, -- O dono da venda
          u_edit.nome as editor_nome    -- Quem mexeu por último
        FROM pedidos p
        LEFT JOIN usuarios u_vend ON p.vendedor_id = u_vend.id
        LEFT JOIN usuarios u_edit ON p.atualizado_por = u_edit.id
        WHERE p.empresa_id = ${payload.empresa_id}
        ${statusFiltro && statusFiltro !== 'TODOS' ? sql`AND p.status = ${statusFiltro}` : sql``}
        ORDER BY p.updated_at DESC NULLS LAST, p.id DESC
      `
      return pedidos
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      return []
    }
  }

  // --- PUT: ATUALIZAR STATUS ---
  if (method === 'PUT') {
    const body = await readBody(event)
    if (!body.id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

    try {
      // Aqui gravamos o ID de quem está logado (payload.id) na coluna atualizado_por
      await sql`
        UPDATE pedidos SET 
          status = ${body.status},
          atualizado_por = ${payload.id}, 
          updated_at = NOW()
        WHERE id = ${body.id} AND empresa_id = ${payload.empresa_id}
      `
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      throw createError({ statusCode: 500, message: 'Erro ao atualizar pedido' })
    }
  }
})