import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, getQuery, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
    const query = getQuery(event)
    
    // Filtro Dinâmico de Status
    // Se status for 'TODOS' ou não vier, não filtra nada (traz tudo)
    let statusFilter = sql``
    if (query.status && query.status !== 'TODOS') {
        statusFilter = sql`AND p.status = ${query.status as string}`
    }

    // Busca pedidos + Nome do Vendedor (JOIN)
    // COALESCE(u.nome, 'Sistema') garante que não quebre se não tiver usuário
    const pedidos = await sql`
      SELECT 
        p.*,
        COALESCE(u.nome, 'Sistema') as vendedor_nome,
        (
          SELECT json_agg(i) 
          FROM pedidos_itens i 
          WHERE i.pedido_id = p.id
        ) as itens
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id 
      WHERE p.empresa_id = ${user.empresa_id} 
      ${statusFilter} 
      ORDER BY p.id DESC
    `
    return pedidos
    
  } catch (e: any) {
    console.error("Erro ao buscar pedidos:", e)
    // Retorna array vazio em vez de erro 500 para não quebrar a tela
    return []
  }
})