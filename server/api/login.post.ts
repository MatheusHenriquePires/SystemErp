import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  // 1. Ler o que veio da tela (Frontend)
  const body = await readBody(event)
  const { email, senha } = body

  console.log('--- TENTATIVA DE LOGIN ---')
  console.log('Email recebido:', email)
  console.log('Senha recebida:', senha)

  try {
    // 2. Buscar no banco
    const usuarios = await sql`
      SELECT * FROM usuarios 
      WHERE email = ${email} 
      AND senha = ${senha}
    `
    
    console.log('Usuários encontrados:', usuarios.length)

    // 3. Se não achou ninguém
    if (usuarios.length === 0) {
      console.log('❌ Login FALHOU: Usuário não encontrado no banco.')
      throw createError({ statusCode: 401, message: 'Email ou senha inválidos' })
    }

    // 4. Se achou, prepara o cookie
    const usuario = usuarios[0]
    console.log('✅ Login SUCESSO! Usuário:', usuario.nome)

    // Define o cookie de sessão
    setCookie(event, 'usuario_sessao', JSON.stringify(usuario), {
      httpOnly: false, // Deixei false para facilitar o teste
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    })

    return { sucesso: true, usuario }

  } catch (erro) {
    console.log('🔥 ERRO CRÍTICO NO BANCO:', erro)
    throw createError({ statusCode: 500, message: 'Erro no servidor' })
  }
})