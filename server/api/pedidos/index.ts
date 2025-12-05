// server/api/pedidos/index.ts
import sql from '~/server/database'
import { defineEventHandler, getCookie, getQuery, createError, readBody } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // 1. Autenticação e Segurança
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
  
  // Decodifica o token para pegar ID do usuário e ID da empresa
  const payload = jwt.decode(cookie) as { id: number, nome: string, empresa_id: number }

  const method = event.node.req.method

  // --- GET: Listar Pedidos ---
  if (method === 'GET') {
    const query = getQuery(event)
    const statusFiltro = query.status as string

    try {
      // Fazemos JOIN com a tabela de usuários para pegar o nome de quem atualizou
      const pedidos = await sql`
        SELECT 
          p.*,
          -- Se cliente_nome não estiver na tabela pedidos, teria que fazer join com clientes
          p.cliente_nome, 
          u_up.nome as atualizador_nome, -- Nome de quem atualizou
          u_vend.nome as vendedor_nome   -- Nome do vendedor original
        FROM pedidos p
        LEFT JOIN usuarios u_up ON p.atualizado_por = u_up.id
        LEFT JOIN usuarios u_vend ON p.vendedor_id = u_vend.id -- Assumindo que você tem vendedor_id
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
  }

  // --- PUT: Atualizar Status ---
  if (method === 'PUT') {
    const body = await readBody(event)
    if (!body.id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

    try {
      await sql`
        UPDATE pedidos SET 
          status = ${body.status},
          atualizado_por = ${payload.id}, -- Salva quem está mexendo agora
          updated_at = NOW()              -- Atualiza a data/hora
        WHERE id = ${body.id} AND empresa_id = ${payload.empresa_id}
      `
      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      throw createError({ statusCode: 500, message: 'Erro ao atualizar pedido' })
    }
  }
})