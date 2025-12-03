import postgres from 'postgres'
import { defineEventHandler, getCookie, createError, getRouterParam } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

// Função auxiliar para decodificar o token (reutilizada)
function lerToken(token: string) {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(base64, 'base64');
    return JSON.parse(buffer.toString('utf-8'));
}

export default defineEventHandler(async (event) => {
    // 1. Segurança e ID
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do produto obrigatório' })

    try {
        // 2. Busca o produto (Garante que busca o produto apenas da empresa do usuário)
        const produto = await sql`
            SELECT id, nome, preco, estoque_atual, tipo
            FROM produtos 
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
        `
        if (produto.length === 0) throw createError({ statusCode: 404, message: 'Produto não encontrado.' })

        return produto[0]

    } catch (error: any) {
        throw createError({ statusCode: 500, message: `Erro ao buscar produto: ${error.message}` })
    }
})