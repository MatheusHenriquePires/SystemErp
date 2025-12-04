// server/api/pedidos/[id].ts (Busca de Detalhes do Pedido - Corrigido para nomes brutos)
import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

function lerToken(token: string) { /* ... (função mantida) */ }

export default defineEventHandler(async (event) => {
    // ... (Segurança mantida)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório.' });

    try {
        // ... (Busca do Cabeçalho mantida)
        const [dados] = await sql`
            SELECT
                p.id, p.data_criacao as data_criacao, p.valor_total as valor_total, p.payment_terms, p.status, p.cliente_nome,
                p.markup_percent, p.final_total, 
                e.nome as empresa_nome
            FROM pedidos p
            LEFT JOIN empresas e ON p.empresa_id = e.id
            WHERE p.id = ${id} AND p.empresa_id = ${usuario.empresa_id}
        `

        if (!dados) throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })

        // 4. Pega os Itens - [FINAL: USANDO NOMES BRUTOS PARA EVITAR ERROS DE ALIAS]
        const itens = await sql`
            SELECT
                descricao, quantidade, preco_unitario, total_preco, comodo -- TODOS NOMES DE COLUNAS BRUTOS
            FROM pedidos_itens
            WHERE pedido_id = ${id}
        `

        // ... (Restante da função mantida)
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