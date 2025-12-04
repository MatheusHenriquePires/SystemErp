// server/api/pedidos/[id].ts (Busca de Detalhes do Pedido - ÚLTIMA TENTATIVA DE ORDEM)
import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

function lerToken(token: string) { /* ... (função mantida) ... */ }

export default defineEventHandler(async (event) => {
    // ... (Segurança mantida)
    const cookie = getCookie(event, 'usuario_sessao')
    // ...

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório.' });

    try {
        // ... (Busca do Cabeçalho mantida)

        // 4. Pega os Itens - [FINAL: COMODO É A PRIMEIRA COLUNA]
        const itens = await sql`
            SELECT
                comodo, -- FORÇADO COMO PRIMEIRA COLUNA
                descricao, 
                quantidade, 
                preco_unitario, 
                total_preco
            FROM pedidos_itens
            WHERE pedido_id = ${id}
        `

        // 5. Retorna
        return {
            // ...dados,
            itens: itens
        }

    } catch (e: any) {
        // ...
    }
})