import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any
    
    // Busca clientes APENAS da empresa do usuário
    const clientes = await sql`
      SELECT * FROM clientes 
      WHERE empresa_id = ${user.empresa_id} 
      ORDER BY id DESC
    `
    return clientes
    
  } catch (e) {
    return []
  }
})