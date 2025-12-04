import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, getQuery, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
    const query = getQuery(event) // Pega o ?status=... da URL
    
    // Filtro Dinâmico
    let statusFilter = sql``
    if (query.status && query.status !== 'TODOS') {
        // Filtra pelo status exato que vem do front (ex: 'Orçamento', 'VENDA')
        statusFilter = sql`AND p.status = ${query.status as string}`
    }

    // Query Principal
    const pedidos = await sql`
      SELECT 
        p.*,
        u.nome as vendedor_nome, -- Pega o nome do usuário que criou
        (
          SELECT json_agg(i) 
          FROM pedidos_itens i 
          WHERE i.pedido_id = p.id
        ) as itens
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id -- Relaciona com a tabela de usuários
      WHERE p.empresa_id = ${user.empresa_id} 
      ${statusFilter} -- Aplica o filtro de status aqui
      ORDER BY p.id DESC
    `
    return pedidos
    
  } catch (e) {
    console.error("Erro ao buscar pedidos:", e)
    return []
  }
})