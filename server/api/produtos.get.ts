import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    const usuario = JSON.parse(cookie)

    // 2. Busca produtos
    const produtos = await sql`
        SELECT * FROM produtos
        WHERE empresa_id = ${usuario.empresa_id}
        ORDER BY nome ASC
    `
    return produtos
})