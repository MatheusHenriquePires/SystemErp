import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    const usuario = JSON.parse(cookie)

    const body = await readBody(event)
    const { nome, preco, estoque, tipo } = body

    // Converte o preço para número (caso venha texto)
    const precoFinal = parseFloat(preco)

    await sql`
        INSERT INTO produtos (nome, preco, estoque_atual, tipo, empresa_id)
        VALUES (${nome}, ${precoFinal}, ${estoque || 0}, ${tipo || 'produto'}, ${usuario.empresa_id})
    `
    return { sucesso: true }
})