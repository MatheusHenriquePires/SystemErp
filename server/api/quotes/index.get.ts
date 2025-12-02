import sql from '~/server/database'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
    try {
        // Busca Simples: ID, Data, Total, Status e Nome do Cliente
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                COALESCE(c.nome, 'Cliente Manual') as cliente_nome
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            ORDER BY q.id DESC
        `
        
        // Retorna exatamente o que o banco deu
        return quotes
    } catch (e) {
        return []
    }
})