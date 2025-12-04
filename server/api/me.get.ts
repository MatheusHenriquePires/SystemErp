// server/api/me.get.ts
import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Não autenticado' })

  try {
    const session = jwt.verify(token, process.env.JWT_SECRET as string) as any
    
    // Busca o nome atualizado no banco para garantir
    const [user] = await sql`
        SELECT id, nome, email 
        FROM usuarios 
        WHERE id = ${session.id}
    `
    return user
  } catch (error) {
    return null
  }
})