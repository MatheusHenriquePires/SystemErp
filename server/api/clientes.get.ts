import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    // 1. Segurança: Quem está pedindo?
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    const usuario = JSON.parse(cookie)

    // 2. Busca os clientes SÓ dessa empresa
    const clientes = await sql`
        SELECT * FROM clientes
        WHERE empresa_id = ${usuario.empresa_id}
        ORDER BY nome ASC
    `
    return clientes
})