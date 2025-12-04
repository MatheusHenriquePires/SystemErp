// server/api/pedidos/[id].ts (FINAL: Usando Aspas Duplas para Forçar a Leitura)
import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

function lerToken(token: string) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(base64, 'base64');
        return JSON.parse(buffer.toString('utf-8'));
    } catch (e) {
        return null;
    }
}

export default defineEventHandler(async (event) => {
    // 1. SEGURANÇA (Mantida)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório.' });

    try {
        // 3. Pega o Cabeçalho (Quoted)
        const [dados] = await sql`
            SELECT
                p.id, p.data_criacao AS data_criacao, p.valor_total AS valor_total, p.payment_terms, p.status, p.cliente_nome,
                p.markup_percent, p.final_total, 
                e.nome AS empresa_nome
            FROM pedidos p
            LEFT JOIN empresas e ON p.empresa_id = e.id
            WHERE p.id = ${id} AND p.empresa_id = ${usuario.empresa_id}
        `

        if (!dados) throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })

        // 4. Pega os Itens - [USANDO ASPAS DUPLAS PARA FORÇAR A LEITURA DO COMODO]
        const itens = await sql`
            SELECT
                "comodo", -- PRIMEIRO E QUOTED
                descricao, 
                quantidade, 
                preco_unitario, 
                total_preco
            FROM pedidos_itens
            WHERE pedido_id = ${id}
        `

        // 5. Retorna
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