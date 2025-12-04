import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
  const id = event.context.params?.id

  if (!id) throw createError({ statusCode: 400, message: 'ID do pedido obrigatório' })

  try {
    // Busca o pedido, dados do cliente e monta o JSON dos itens
    const [pedido] = await sql`
      SELECT 
        p.*,
        c.nome as nome_cliente,
        c.email as cliente_email,
        c.telefone as cliente_telefone,
        c.cidade as cliente_cidade,
        (
          SELECT json_agg(
            json_build_object(
              'id', i.id,
              'descricao', i.descricao,
              'quantidade', i.quantidade,
              'preco_unitario', i.preco_unitario,
              'comodo', i.comodo  -- ✅ AQUI ESTAVA FALTANDO! Agora ele vai enviar o cômodo.
            )
          ) 
          FROM pedidos_itens i 
          WHERE i.pedido_id = p.id
        ) as itens
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ${id} AND p.empresa_id = ${user.empresa_id}
    `

    if (!pedido) {
        throw createError({ statusCode: 404, message: 'Pedido não encontrado' })
    }

    return pedido
    
  } catch (e: any) {
    console.error("Erro ao buscar pedido:", e)
    throw createError({ statusCode: 500, message: `Erro: ${e.message}` })
  }
})