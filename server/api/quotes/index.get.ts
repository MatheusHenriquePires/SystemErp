import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    // Se não tiver login, retorna vazio (segurança)
    if (!cookie) return [] 
    
    // Decodifica o cookie apenas se necessário, mas para essa query "Libera Geral" nem precisa
    // const usuario = JSON.parse(cookie) 

    try {
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                -- AQUI ESTAVA O ERRO: Era c.name, mudamos para c.nome
                COALESCE(c.nome, 'Cliente Manual') as cliente_nome
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            ORDER BY q.id DESC
        `
        
        return quotes.map(q => ({
            id: q.id,
            cliente_nome: q.cliente_nome,
            data_venda: q.quote_date,
            valor_total: Number(q.total_amount),
            status: q.status || 'rascunho'
        }))

    } catch (e) {
        // Agora vamos ver o erro no terminal se acontecer de novo
        console.error("ERRO CRÍTICO NA LISTA:", e)
        return []
    }
})