import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    const usuario = JSON.parse(cookie)

    try {
        // Busca orçamentos fazendo JOIN com clientes para filtrar pela empresa
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                c.nome as cliente_nome
            FROM quotes q
            JOIN clientes c ON q.customer_id = c.id
            WHERE c.empresa_id = ${usuario.empresa_id}
            ORDER BY q.id DESC
        `
        
        // Mapeia para o formato que o frontend espera (snake_case para camelCase se precisar, ou mantém)
        return quotes.map(q => ({
            id: q.id,
            cliente_nome: q.cliente_nome,
            data_venda: q.quote_date,
            valor_total: Number(q.total_amount),
            status: q.status
        }))

    } catch (e) {
        console.error("Erro ao listar orçamentos:", e)
        return []
    }
})