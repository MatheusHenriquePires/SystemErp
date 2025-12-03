import postgres from 'postgres'
import { defineEventHandler, getCookie, createError, getRouterParam, readBody } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

// Função auxiliar (reutilizada)
function lerToken(token: string) {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(base64, 'base64');
    return JSON.parse(buffer.toString('utf-8'));
}

export default defineEventHandler(async (event) => {
    // 1. Segurança e IDs
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    const usuario = lerToken(cookie)

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id || !usuario || !body.nome || !body.preco) {
        throw createError({ statusCode: 400, message: 'Dados incompletos.' })
    }

    try {
        // 2. Executa a atualização
        const [updated] = await sql`
            UPDATE produtos
            SET 
                nome = ${body.nome},
                preco = ${body.preco},
                estoque_atual = ${body.estoque_atual},
                tipo = ${body.tipo || 'produto'}
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id, nome
        `

        if (!updated) {
             throw createError({ statusCode: 404, message: 'Produto não encontrado ou você não tem permissão para editar.' })
        }

        return { success: true, produto: updated }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: `Erro ao atualizar: ${error.message}` })
    }
})