import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    const usuario = JSON.parse(cookie)

    // Pega o ID da URL (ex: /api/quotes/15)
    const id = getRouterParam(event, 'id')

    try {
        // 1. Busca Cabeçalho + Cliente
        const [quote] = await sql`
            SELECT 
                q.id, q.quote_date, q.total_amount, q.payment_terms, q.status,
                c.name as cliente_nome, c.email as cliente_email, c.telefone as cliente_telefone,
                c.cidade as cliente_cidade,
                e.nome as empresa_nome -- Nome da SUA agência
            FROM quotes q
            JOIN clientes c ON q.customer_id = c.id
            JOIN empresas e ON c.empresa_id = e.id
            WHERE q.id = ${id} AND c.empresa_id = ${usuario.empresa_id}
        `

        if (!quote) throw createError({ statusCode: 404, message: 'Orçamento não encontrado' })

        // 2. Busca os Itens
        const items = await sql`
            SELECT name, quantity, unit_price, total_price
            FROM quote_items
            WHERE quote_id = ${id}
        `

        return { ...quote, items }

    } catch (e) {
        throw createError({ statusCode: 500, message: 'Erro ao buscar detalhes' })
    }
})