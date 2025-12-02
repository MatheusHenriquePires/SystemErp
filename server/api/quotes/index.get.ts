import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    const usuario = JSON.parse(cookie)

    try {
        // QUERY CORRIGIDA:
        // 1. Busca na tabela quotes (q)
        // 2. Junta com clientes (c)
        // 3. Filtra pela empresa do cliente
        const quotes = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.status,
                c.name as cliente_nome
            FROM quotes q
            JOIN clientes c ON q.customer_id = c.id
            WHERE c.empresa_id = ${usuario.empresa_id}
            ORDER BY q.id DESC
        `
        
        // Mapeamento seguro para o frontend
        return quotes.map(q => ({
            id: q.id,
            cliente_nome: q.cliente_nome,
            data_venda: q.quote_date,
            valor_total: Number(q.total_amount), // Garante que é número
            status: q.status
        }))

    } catch (e) {
        console.error("Erro ao listar:", e)
        return []
    }
})