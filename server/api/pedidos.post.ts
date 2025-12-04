import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
  const body = await readBody(event)

  // Validação básica
  if (!body.cliente_id || !body.itens || body.itens.length === 0) {
    throw createError({ statusCode: 400, message: 'Pedido precisa de cliente e itens.' })
  }

  try {
    // 1. Cria o cabeçalho do Pedido
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

    // 2. Insere os Itens do Pedido
    // ✅ CORREÇÃO: Usando APENAS as colunas que existem na sua tabela:
    // id, pedido_id, descricao, quantidade, preco_unitario, comodo
    for (const item of body.itens) {
      await sql`
        INSERT INTO pedidos_itens (
            pedido_id, 
            comodo, 
            descricao, 
            quantidade, 
            preco_unitario
        )
        VALUES (
          ${pedidoId}, 
          ${item.comodo}, 
          ${item.descricao}, 
          ${item.quantidade}, 
          ${item.preco_unitario}
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