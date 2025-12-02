import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    const usuario = JSON.parse(cookie)

    // 2. Busca orçamentos da empresa
    try {
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date as data, 
                q.total_amount as valor_total, 
                q.status,
                c.name as cliente_nome
            FROM quotes q
            JOIN clientes c ON q.customer_id = c.id
            WHERE q.status = 'draft'  -- Remova essa linha se quiser ver todos
            -- E q.empresa_id não existe na tabela quotes original, precisamos corrigir isso!
            ORDER BY q.quote_date DESC
        `
        
        // A tabela 'quotes' original que criamos NÃO tinha empresa_id (falha minha no script SQL inicial).
        // Ela se ligava ao cliente, que tem empresa_id.
        // Vamos corrigir a query para filtrar pelos clientes da empresa:
        
        /* CORREÇÃO DA QUERY (Use esta versão): */
        const quotesCorrigido = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                c.nome as cliente_nome
            FROM quotes q
            JOIN clientes c ON q.customer_id = c.id
            WHERE c.empresa_id = ${usuario.empresa_id}
            ORDER BY q.quote_date DESC
        `

        return quotesCorrigido
        
    } catch (e) {
        console.error(e)
        return []
    }
})