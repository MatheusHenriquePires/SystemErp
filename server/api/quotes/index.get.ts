import sql from '~/server/database'
import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. Autenticação (Sem bloquear se der erro, para debug)
    const cookie = getCookie(event, 'usuario_sessao')
    const usuario = cookie ? JSON.parse(cookie) : null

    try {
        // 2. QUERY BLINDADA
        // Trazemos a tabela quotes (q) e tentamos pegar o nome do cliente (c)
        // Se o cliente não existir ou o vínculo estiver quebrado, traz o orçamento mesmo assim.
        
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                COALESCE(c.name, 'Cliente Manual/Removido') as cliente_nome
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            ORDER BY q.id DESC
        `
        
        // 3. Mapeamento para o formato que a tela espera
        return quotes.map(q => ({
            id: q.id,
            cliente_nome: q.cliente_nome,
            data_venda: q.quote_date,
            valor_total: Number(q.total_amount),
            status: q.status
        }))

    } catch (e) {
        console.error("Erro grave na lista:", e)
        return []
    }
})