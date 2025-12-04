import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
    
    // Busca os pedidos com seus itens agrupados (JSON)
    const pedidos = await sql`
      SELECT 
        p.*,
        (
          SELECT json_agg(i) s
          FROM pedidos_itens i 
          WHERE i.pedido_id = p.id
        ) as itens
      FROM pedidos p
      WHERE p.empresa_id = ${user.empresa_id} 
      ORDER BY p.id DESC
    `
    return pedidos
    
  } catch (e) {
    console.error(e)
    return []
  }
})