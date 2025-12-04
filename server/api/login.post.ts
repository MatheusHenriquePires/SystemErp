import jwt from 'jsonwebtoken'
import postgres from 'postgres'
import { defineEventHandler, readBody, setCookie, createError } from 'h3'

// Conexão com Banco
const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  // 1. Recebe os dados
  const body = await readBody(event)

  if (!body.email || !body.senha) {
    throw createError({
      statusCode: 400,
      message: 'Email e senha são obrigatórios'
    })
  }

  // 2. Busca usuário
  const usuarios = await sql`
    SELECT * FROM usuarios 
    WHERE email = ${body.email}
  `
  const usuario = usuarios[0]

  // 3. Valida senha
  // Nota: Em produção, use bcrypt.compare()
  if (!usuario || usuario.senha !== body.senha) {
    throw createError({
      statusCode: 401,
      message: 'Email ou senha incorretos'
    })
  }

  if (!process.env.JWT_SECRET) {
    console.error('ERRO: JWT_SECRET faltando no .env')
    throw createError({ statusCode: 500, message: 'Erro interno no servidor' })
  }

  // 4. Cria Token
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      empresa_id: usuario.empresa_id 
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )

  // ✅ 5. CORREÇÃO PRINCIPAL AQUI
  // Forçamos 'secure: false' temporariamente para garantir que funcione em localhost
  // Quando subir para o servidor real (com HTTPS), mude para 'true' ou use a variável de ambiente.
  const isProduction = process.env.NODE_ENV === 'production'

  setCookie(event, 'usuario_sessao', token, {
    httpOnly: true,
    // ⚠️ MUDANÇA: Se estiver dando erro em localhost, deixe false fixo por enquanto
    secure: false, // isProduction (Deixe false para testar agora)
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax' 
  })

  // 6. Retorno limpo
  const { senha, ...usuarioSemSenha } = usuario

  return { 
    success: true, 
    user: usuarioSemSenha 
  }
})