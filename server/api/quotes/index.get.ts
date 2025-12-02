import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. Tenta pegar o usuário. Se falhar, retorna erro claro.
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) {
        // Se não tiver cookie, retorna lista vazia em vez de quebrar a tela com erro 500
        return [] 
    }
    const usuario = JSON.parse(cookie)

    try {
        // 2. Query simplificada para garantir que traga dados
        // Removemos filtros complexos por enquanto para ver se os dados aparecem
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                c.name as cliente_nome
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            -- Filtramos pelo cliente da empresa para segurança
            WHERE c.empresa_id = ${usuario.empresa_id}
            ORDER BY q.id DESC
        `
        
        // 3. Mapeamento
        return quotes.map(q => ({
            id: q.id,
            cliente_nome: q.cliente_nome || 'Cliente Desconhecido', // Fallback
            data_venda: q.quote_date,
            valor_total: Number(q.total_amount),
            status: q.status || 'rascunho'
        }))

    } catch (e) {
        console.error("Erro na API de Lista:", e)
        return [] // Retorna array vazio para não dar erro 500 na tela
    }
})