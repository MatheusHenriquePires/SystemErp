import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  // Pega os dados do usuário logado
  const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
  const body = await readBody(event)

  if (!body.cliente_id || !body.itens || body.itens.length === 0) {
    throw createError({ statusCode: 400, message: 'Pedido precisa de cliente e itens.' })
  }

  try {
    // ✅ 1. Cria o Pedido salvando o usuario_id
    const pedido = await sql`
      INSERT INTO pedidos (
        empresa_id, 
        cliente_id, 
        usuario_id,  -- Nova coluna
        nome_cliente, 
        status, 
        valor_total
      )
      VALUES (
        ${user.empresa_id}, 
        ${body.cliente_id}, 
        ${user.id},  -- Salva o ID de quem está logado
        ${body.nome_cliente}, 
        ${body.status || 'Orçamento'}, 
        ${body.valor_total}
      )
      RETURNING id
    `
    const pedidoId = pedido[0].id

    // 2. Insere os Itens
    for (const item of body.itens) {
      await sql`
        INSERT INTO pedidos_itens (pedido_id, comodo, descricao, medidas, material, preco_custo, multiplicador, preco_venda)
        VALUES (
          ${pedidoId}, 
          ${item.comodo}, 
          ${item.descricao}, 
          ${item.medidas}, 
          ${item.material}, 
          ${item.preco_custo}, 
          ${item.multiplicador}, 
          ${item.preco_venda}
        )
      `
    }

    return { success: true, id: pedidoId }

  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro ao processar pedido' })
  }
})