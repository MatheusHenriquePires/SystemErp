// server/api/pedidos/[id].ts (Busca de Detalhes do Pedido - Final Definitivo e Estável)
import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // ... (Segurança mantida)

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório.' });

    try {
        // Busca do Cabeçalho do Pedido
        const dados = await sql`
            SELECT * FROM pedidos WHERE id = ${id}
        `
        
        if (!dados || dados.length === 0) {
            throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })
        }

        // 4. Pega os Itens - [BUSCA MAIS ESTÁVEL COM ALIASES]
        const itens = await sql`
            SELECT
                quantidade AS quantity, 
                preco_unitario AS unit_price, 
                total_preco AS total_price,
                comodo AS room_name
            FROM pedidos_itens
            WHERE pedido_id = ${id}
        `

        // 5. Retorna
        return {
            ...dados[0],
            itens: itens
        }

    } catch (e: any) {
        console.error("Erro ao buscar detalhes do pedido:", e);
        if (e.statusCode === 404) throw e;
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar dados do pedido.' })
    }
})