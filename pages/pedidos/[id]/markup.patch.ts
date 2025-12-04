import postgres from 'postgres'
import { defineEventHandler, getCookie, createError, getRouterParam, readBody } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

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
    const markupPercent = parseFloat(body.markup_percent)

    if (!id || !usuario || isNaN(markupPercent)) {
        throw createError({ statusCode: 400, message: 'Dados incompletos ou porcentagem inválida.' })
    }

    try {
        // 2. Busca o valor original (que está em 'total' ou 'valor_total')
        const [pedido] = await sql`
            SELECT valor_total, total, status
            FROM pedidos 
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
        `

        if (!pedido) {
             throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })
        }
        
        // Usa o valor que o banco tiver (valor_total ou total)
        const originalTotal = parseFloat(pedido.valor_total || pedido.total)
        
        // 3. Calcula o novo total com markup
        const finalTotal = originalTotal * (1 + markupPercent / 100)

        // 4. Executa a atualização (Atualiza as novas colunas)
        const [updated] = await sql`
            UPDATE pedidos
            SET 
                markup_percent = ${markupPercent},
                final_total = ${finalTotal}
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id, final_total, markup_percent
        `

        return { success: true, updated }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: `Erro ao aplicar markup: ${error.message}` })
    }
})