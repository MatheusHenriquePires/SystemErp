import sql from '~/server/database'
import { defineEventHandler, getCookie, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    const usuario = JSON.parse(cookie)

    const id = getRouterParam(event, 'id')

    try {
        // CORREÇÃO: Adicionamos c.cidade e garantimos c.telefone
        const [quote] = await sql`
            SELECT 
                q.id, q.quote_date, q.total_amount, q.payment_terms, q.status,
                c.nome as cliente_nome, 
                c.email as cliente_email, 
                c.telefone as cliente_telefone,
                c.cidade as cliente_cidade, -- Adicionado Cidade
                e.nome as empresa_nome
            FROM quotes q
            JOIN clientes c ON q.customer_id = c.id
            JOIN empresas e ON c.empresa_id = e.id
            WHERE q.id = ${id} AND c.empresa_id = ${usuario.empresa_id}
        `

        if (!quote) throw createError({ statusCode: 404, message: 'Orçamento não encontrado' })

        const items = await sql`
            SELECT name, quantity, unit_price, total_price
            FROM quote_items
            WHERE quote_id = ${id}
        `

        return { ...quote, items }

    } catch (e) {
        console.error("Erro detalhe:", e)
        throw createError({ statusCode: 500, message: 'Erro ao buscar' })
    }
})