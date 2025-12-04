// server/api/pedidos/[id].ts (Código Final e Mais Simples)
import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

function lerToken(token: string) { /* ... (função mantida) ... */ }

export default defineEventHandler(async (event) => {
    // ... (Segurança mantida)

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório.' });

    try {
        // ... (Busca do Cabeçalho mantida)

        // 4. Pega os Itens - [FINAL: BUSCA DE COLUNAS SIMPLES]
        const itens = await sql`
            SELECT
                comodo, -- PRIMEIRO ITEM
                descricao, 
                quantidade, 
                preco_unitario, 
                total_preco
            FROM pedidos_itens
            WHERE pedido_id = ${id}
        `
        // ...
        return {
            ...dados,
            itens: itens
        }

    } catch (e: any) {
        console.error("Erro ao buscar detalhes do pedido:", e);
        if (e.statusCode === 404) throw e;
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar dados do pedido.' })
    }
})