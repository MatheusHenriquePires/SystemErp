import postgres from 'postgres'
import { defineEventHandler } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    try {
        // Busca financeiro unido com pedidos e clientes para saber quem paga
        const lancamentos = await sql`
            SELECT 
                f.*,
                p.id as pedido_id,
                c.nome as cliente_nome
            FROM financeiro f
            JOIN pedidos p ON f.pedido_id = p.id
            LEFT JOIN clientes c ON p.cliente_id = c.id
            ORDER BY 
                CASE WHEN f.status = 'PENDENTE' THEN 1 ELSE 2 END, -- Pendentes primeiro
                f.data_vencimento ASC
        `
        return lancamentos
    } catch (error) {
        return []
    }
})

