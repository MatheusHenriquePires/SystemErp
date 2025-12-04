import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
  const body = await readBody(event)

  if (!body.cliente_id || !body.itens || body.itens.length === 0) {
    throw createError({ statusCode: 400, message: 'Pedido precisa de cliente e itens.' })
  }

  try {
    // 1. Criação do Pedido
    // (Lembre-se: removemos nome_cliente daqui no passo anterior)
    const pedido = await sql`
      INSERT INTO pedidos (
        empresa_id, 
        cliente_id, 
        usuario_id, 
        status, 
        valor_total
      )
      VALUES (
        ${user.empresa_id}, 
        ${body.cliente_id}, 
        ${user.id}, 
        ${body.status || 'Orçamento'}, 
        ${body.valor_total}
      )
      RETURNING id
    `
    const pedidoId = pedido[0].id

    // 2. Inserção dos Itens (CORRIGIDO)
    // Removidas as colunas 'medidas' e 'material' que não existem no banco
    for (const item of body.itens) {
      await sql`
        INSERT INTO pedidos_itens (
            pedido_id, 
            comodo, 
            descricao, 
            quantidade,     -- Certifique-se que sua tabela tem 'quantidade' (geralmente tem)
            preco_custo, 
            multiplicador, 
            preco_venda
        )
        VALUES (
          ${pedidoId}, 
          ${item.comodo}, 
          ${item.descricao}, 
          ${item.quantidade},
          ${item.preco_unitario}, 
          ${item.multiplicador || 1.0}, 
          ${item.preco_venda}
        )
      `
    }

    return { success: true, id: pedidoId }

  } catch (error: any) {
    console.error("Erro ao criar pedido:", error)
    throw createError({ 
      statusCode: 500, 
      message: `Erro interno ao salvar pedido: ${error.message}` 
    })
  }
})