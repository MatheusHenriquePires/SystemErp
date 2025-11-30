import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    const usuario = JSON.parse(cookie)

    // 2. Recebe os dados do formulário
    const body = await readBody(event)
    const { nome, email, telefone, cidade } = body

    // 3. Insere no banco
    await sql`
        INSERT INTO clientes (nome, email, telefone, cidade, empresa_id)
        VALUES (${nome}, ${email}, ${telefone}, ${cidade}, ${usuario.empresa_id})
    `
    return { sucesso: true }
})