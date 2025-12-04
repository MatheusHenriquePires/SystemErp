import jwt from 'jsonwebtoken'
import postgres from 'postgres'
import { defineEventHandler, readBody, setCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. Verifica usuário no banco
  const usuarios = await sql`
    SELECT * FROM usuarios 
    WHERE email = ${body.email} 
    AND senha = ${body.senha}
  `
  const usuario = usuarios[0]

  if (!usuario) {
    throw createError({
      statusCode: 401,
      message: 'Email ou senha incorretos'
    })
  }

  // ✅ 2. Cria o Token COM empresa_id e com a MESMA CHAVE do lerToken
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      empresa_id: usuario.empresa_id // ✅ ESSENCIAL
    },
    process.env.JWT_SECRET as string, // ✅ AGORA BATE COM O lerToken
    { expiresIn: '7d' }
  )

  // ✅ 3. Salva no Cookie corretamente
  setCookie(event, 'usuario_sessao', token, {
    httpOnly: true,                        // ✅ mais seguro
    secure: process.env.NODE_ENV === 'production', // ✅ automático
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return { success: true, user: usuario }
})
