import sql from '~/server/database'
import { defineEventHandler, getCookie, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    
    const id = getRouterParam(event, 'id')

    try {
        // 1. Busca o Orçamento + Cliente + EMPRESA DO CLIENTE
        // O LEFT JOIN garante que não quebra se faltar dado
        const [quote] = await sql`
            SELECT 
                q.id, q.quote_date, q.total_amount, q.payment_terms, q.status,
                c.name as cliente_nome, 
                c.email as cliente_email, 
                c.telefone as cliente_telefone,
                c.cidade as cliente_cidade,
                e.nome as empresa_nome  -- <--- Pega o nome real da empresa no banco
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            LEFT JOIN empresas e ON c.empresa_id = e.id -- <--- Liga o cliente à empresa dele
            WHERE q.id = ${id}
        `

        if (!quote) throw createError({ statusCode: 404, message: 'Orçamento não encontrado' })

        // 2. Busca os Itens
        const items = await sql`
            SELECT name, quantity, unit_price, total_price
            FROM quote_items
            WHERE quote_id = ${id}
        `

        return { 
            ...quote, 
            // Se o banco trouxe o nome, usa ele. Se não, usa um genérico.
            empresa_nome: quote.empresa_nome || 'Minha Empresa', 
            items 
        }

    } catch (e) {
        console.error("Erro detalhe:", e)
        throw createError({ statusCode: 500, message: 'Erro ao buscar detalhes' })
    }
})