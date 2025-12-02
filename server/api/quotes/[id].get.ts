import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        // 1. Pega o Cabeçalho (Orçamento + Cliente + Empresa)
        const [dados] = await sql`
            SELECT 
                q.id, q.quote_date, q.total_amount, q.payment_terms,
                c.nome as cliente_nome, 
                c.email as cliente_email, 
                c.telefone as cliente_telefone,
                c.cidade as cliente_cidade,
                e.nome as empresa_nome
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            LEFT JOIN empresas e ON c.empresa_id = e.id
            WHERE q.id = ${id}
        `

        if (!dados) throw createError({ statusCode: 404, message: 'Não achei' })

        // 2. Pega os Itens
        const itens = await sql`
            SELECT name, quantity, unit_price, total_price
            FROM quote_items
            WHERE quote_id = ${id}
        `

        // 3. Junta tudo num pacote limpo
        return {
            cabecalho: dados,
            itens: itens
        }

    } catch (e) {
        throw createError({ statusCode: 500, message: e.message })
    }
})