import sql from '~/server/database'
import { defineEventHandler, getCookie, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    const usuario = JSON.parse(cookie)

    const id = getRouterParam(event, 'id')

    try {
        // QUERY CORRETA: Filtra pela empresa do CLIENTE (c.empresa_id)
        const [quote] = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.payment_terms, 
                q.status,
                c.name as cliente_nome, 
                c.email as cliente_email, 
                c.telefone as cliente_telefone,
                c.cidade as cliente_cidade,
                e.nome as empresa_nome
            FROM quotes q
            JOIN clientes c ON q.customer_id = c.id
            LEFT JOIN empresas e ON c.empresa_id = e.id
            WHERE q.id = ${id} 
            AND c.empresa_id = ${usuario.empresa_id} -- <--- O FILTRO É AQUI (Tabela Clientes)
        `

        if (!quote) {
            throw createError({ statusCode: 404, message: 'Orçamento não encontrado ou acesso negado.' })
        }

        const items = await sql`
            SELECT name, quantity, unit_price, total_price
            FROM quote_items
            WHERE quote_id = ${id}
        `

        return { 
            ...quote, 
            empresa_nome: quote.empresa_nome || 'Agência NetMark', 
            items 
        }

    } catch (e) {
        console.error("Erro PDF:", e)
        throw createError({ statusCode: 500, message: 'Erro ao buscar PDF' })
    }
})