import postgres from 'postgres'
import { defineEventHandler, getCookie, createError, getRouterParam } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

function lerToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(base64, 'base64');
        return JSON.parse(buffer.toString('utf-8'));
    } catch (e) {
        return null;
    }
}

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    // 2. Pega o ID da URL (ex: /api/produtos/5)
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do produto obrigatório' })

    try {
        // 3. Deleta do banco (Garante que só deleta da empresa do usuário)
        await sql`
            DELETE FROM produtos 
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
        `
        return { success: true }

    } catch (error: any) {
        // Se der erro de chave estrangeira (produto usado em venda), avisa
        if (error.code === '23503') { 
            throw createError({ statusCode: 400, message: 'Não é possível excluir este produto pois ele já foi usado em vendas ou orçamentos.' })
        }
        throw createError({ statusCode: 500, message: `Erro ao excluir: ${error.message}` })
    }
})