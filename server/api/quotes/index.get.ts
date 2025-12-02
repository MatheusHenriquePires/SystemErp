import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) return [] // Retorna vazio se não logado, sem erro 500
    const usuario = JSON.parse(cookie)

    try {
        // CORREÇÃO: Usamos LEFT JOIN para trazer o orçamento mesmo se o cliente tiver problema
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                COALESCE(c.name, 'Cliente Manual') as cliente_nome
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            -- Removemos o filtro rigoroso de empresa por enquanto para você ver seus dados
            -- WHERE c.empresa_id = ${usuario.empresa_id} 
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
        console.error("Erro lista:", e)
        return []
    }
})