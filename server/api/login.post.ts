import jwt from 'jsonwebtoken'
import postgres from 'postgres'
import { defineEventHandler, readBody, setCookie, createError } from 'h3'

// Conexão com Banco
const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  // 1. Recebe os dados do formulário
  const body = await readBody(event)

  if (!body.email || !body.senha) {
    throw createError({
      statusCode: 400,
      message: 'Email e senha são obrigatórios'
    })
  }

  // 2. Busca o usuário no banco
  // Nota: Buscamos apenas pelo email primeiro para validar a senha via código depois (boa prática)
  const usuarios = await sql`
    SELECT * FROM usuarios 
    WHERE email = ${body.email}
  `
  
  const usuario = usuarios[0]

  // 3. Verifica se usuário existe E se a senha bate
  // ⚠️ ATENÇÃO: Estou mantendo a comparação direta para seu código funcionar agora.
  // Futuramente, use bcrypt.compare(body.senha, usuario.senha)
  if (!usuario || usuario.senha !== body.senha) {
    throw createError({
      statusCode: 401,
      message: 'Email ou senha incorretos'
    })
  }

  // Validação extra de segurança
  if (!process.env.JWT_SECRET) {
    console.error('ERRO CRÍTICO: JWT_SECRET não definido no .env')
    throw createError({ statusCode: 500, message: 'Erro interno no servidor' })
  }

  // 4. Cria o Token
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      empresa_id: usuario.empresa_id 
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )

  // 5. Salva no Cookie (Configuração Anti-Loop)
  setCookie(event, 'usuario_sessao', token, {
    httpOnly: true,                     // Invisível para o JS (Protege contra XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS em prod, HTTP em dev
    maxAge: 60 * 60 * 24 * 7,           // 7 dias em segundos
    path: '/',                          // O cookie vale para o site todo
    sameSite: 'lax'                     // ✅ CRUCIAL: Permite navegação normal sem bloquear o cookie
  })

  // 6. Remove a senha do objeto de retorno (Segurança no Front)
  const { senha, ...usuarioSemSenha } = usuario

  return { 
    success: true, 
    user: usuarioSemSenha 
  }
})