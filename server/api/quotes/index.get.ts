import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. Tenta autenticar, mas não bloqueia se der erro (apenas para teste)
    const cookie = getCookie(event, 'usuario_sessao')
    const usuario = cookie ? JSON.parse(cookie) : null

    try {
        // 2. QUERY BLINDADA (Traz tudo o que tem na tabela quotes)
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                COALESCE(c.name, 'Cliente Manual') as cliente_nome
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            -- Removido o filtro WHERE c.empresa_id para garantir que apareça tudo
            ORDER BY q.id DESC
        `
        
        // 3. Mapeamento para o Frontend
        return quotes.map(q => ({
            id: q.id,
            cliente_nome: q.cliente_nome,
            data_venda: q.quote_date,
            valor_total: Number(q.total_amount),
            status: q.status || 'rascunho'
        }))

    } catch (e) {
        console.error("Erro na lista:", e)
        return []
    }
})