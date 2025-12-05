import sql from '~/server/database'
import { defineEventHandler, getCookie, getQuery, createError, readBody } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
  
  const payload = jwt.decode(cookie) as { id: number, empresa_id: number }
  const method = event.node.req.method

  // --- GET: Listar Pedidos ---
  if (method === 'GET') {
    const query = getQuery(event)
    const statusFiltro = query.status as string

    try {
      return await sql`
        SELECT 
          p.*,
          p.cliente_nome,
          u_vend.nome as vendedor_nome,
          u_edit.nome as editor_nome
        FROM pedidos p
        LEFT JOIN usuarios u_vend ON p.vendedor_id = u_vend.id
        LEFT JOIN usuarios u_edit ON p.atualizado_por = u_edit.id
        WHERE p.empresa_id = ${payload.empresa_id}
        ${statusFiltro && statusFiltro !== 'TODOS' ? sql`AND p.status = ${statusFiltro}` : sql``}
        ORDER BY p.updated_at DESC NULLS LAST, p.id DESC
      `
    } catch (error) {
      console.error(error)
      return []
    }
  }

  // --- PUT: Atualizar Status ---
  if (method === 'PUT') {
    const body = await readBody(event)
    try {
      await sql`
        UPDATE pedidos SET 
          status = ${body.status},
          atualizado_por = ${payload.id}, 
          updated_at = NOW()
        WHERE id = ${body.id} AND empresa_id = ${payload.empresa_id}
      `
      return { success: true }
    } catch (error) {
      throw createError({ statusCode: 500, message: 'Erro ao atualizar' })
    }
  }

  // --- POST: CRIAR PEDIDO E BAIXAR ESTOQUE (NOVO!) ---
  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.cliente_id) throw createError({ statusCode: 400, message: 'Cliente obrigatório' })
    if (!body.itens || body.itens.length === 0) throw createError({ statusCode: 400, message: 'Adicione produtos' })

    try {
        // Usamos transação (.begin) para garantir segurança: 
        // ou salva tudo (pedido + itens + estoque) ou não salva nada se der erro.
        const resultado = await sql.begin(async sql => {
            
            // 1. Busca nome do cliente para histórico
            const [cli] = await sql`SELECT nome FROM clientes WHERE id = ${body.cliente_id}`
            const nomeCliente = cli?.nome || 'Consumidor Final'

            // 2. Cria o Pedido
            const [pedido] = await sql`
                INSERT INTO pedidos (
                    empresa_id, vendedor_id, cliente_id, cliente_nome, 
                    status, valor_total, data_criacao
                ) VALUES (
                    ${payload.empresa_id}, ${payload.id}, ${body.cliente_id}, ${nomeCliente},
                    ${body.status || 'ORCAMENTO'}, ${body.valor_total}, NOW()
                )
                RETURNING id
            `

            // 3. Processa cada Item
            for (const item of body.itens) {
                // Salva o item ligado ao pedido
                await sql`
                    INSERT INTO itens_pedido (
                        pedido_id, produto_id, quantidade, preco_unitario, subtotal
                    ) VALUES (
                        ${pedido.id}, ${item.id}, ${item.quantidade}, ${item.preco}, ${item.total}
                    )
                `

                // BAIXA DE ESTOQUE (Se o produto tiver ID)
                if (item.id) {
                    await sql`
                        UPDATE produtos 
                        SET estoque_atual = estoque_atual - ${item.quantidade}
                        WHERE id = ${item.id}
                    `
                }
            }
            return pedido
        })

        return { success: true, id: resultado.id }

    } catch (error: any) {
        console.error('Erro no POST pedido:', error)
        throw createError({ statusCode: 500, message: 'Erro ao processar venda.' })
    }
  }
})