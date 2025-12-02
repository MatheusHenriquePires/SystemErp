import sql from '~/server/database'
import { defineEventHandler, getCookie, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    
    const id = getRouterParam(event, 'id')

    try {
        console.log(`Buscando orçamento #${id}...`)

        // 1. BUSCA CABEÇALHO + CLIENTE + EMPRESA
        // Usamos LEFT JOIN para não quebrar se o cliente ou empresa tiverem sido deletados
        const [quote] = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.payment_terms, 
                q.status,
                -- Dados do Cliente (Aliases exatos para o Frontend)
                COALESCE(c.name, 'Cliente Manual') as cliente_nome, 
                COALESCE(c.email, '-') as cliente_email, 
                COALESCE(c.telefone, '-') as cliente_telefone,
                COALESCE(c.cidade, '-') as cliente_cidade,
                -- Dados da Empresa
                COALESCE(e.nome, 'Agência NetMark') as empresa_nome
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            LEFT JOIN empresas e ON c.empresa_id = e.id
            WHERE q.id = ${id}
        `

        if (!quote) {
            console.error(`Orçamento #${id} não encontrado no banco.`)
            throw createError({ statusCode: 404, message: 'Orçamento não encontrado.' })
        }

        // 2. BUSCA OS ITENS
        const items = await sql`
            SELECT name, quantity, unit_price, total_price
            FROM quote_items
            WHERE quote_id = ${id}
        `

        // 3. RETORNA TUDO ESTRUTURADO
        // Convertendo números explicitamente para evitar erros de matemática no front
        return { 
            ...quote,
            total_amount: Number(quote.total_amount),
            items: items.map(i => ({
                name: i.name,
                quantity: Number(i.quantity),
                unit_price: Number(i.unit_price),
                total_price: Number(i.total_price)
            }))
        }

    } catch (e) {
        console.error(`Erro fatal ao buscar orçamento #${id}:`, e)
        throw createError({ statusCode: 500, message: 'Erro interno no servidor ao buscar o PDF.' })
    }
})