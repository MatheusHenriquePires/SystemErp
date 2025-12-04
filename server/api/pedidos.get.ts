import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, getQuery, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
    const query = getQuery(event) // Gets query params like ?status=...
    
    // 1. Dynamic Status Filter
    // If status is 'TODOS' or undefined, we select everything.
    // Otherwise, we filter by the specific status.
    let statusFilter = sql``
    if (query.status && query.status !== 'TODOS') {
        statusFilter = sql`AND p.status = ${query.status as string}`
    }

    // 2. Main Query with JOIN
    // We join 'pedidos' (p) with 'usuarios' (u) to get the name.
   const pedidos = await sql`
      SELECT 
        p.*,
        c.nome as nome_cliente, -- Busca o nome na tabela de clientes
        c.cidade as cliente_cidade, -- Opcional: útil para o frontend
        COALESCE(u.nome, 'Sistema') as vendedor_nome,
        (
          SELECT json_agg(i) 
          FROM pedidos_itens i 
          WHERE i.pedido_id = p.id
        ) as itens
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id 
      LEFT JOIN clientes c ON p.cliente_id = c.id -- ADICIONADO ESSE JOIN
      WHERE p.empresa_id = ${user.empresa_id} 
      ${statusFilter} 
      ORDER BY p.id DESC
    `
    return pedidos
    
  } catch (e: any) {
    console.error("Erro ao buscar pedidos:", e)
    // Return empty array instead of 500 to prevent frontend crash
    return [] 
  }
})