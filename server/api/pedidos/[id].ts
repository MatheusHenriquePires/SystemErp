// server/api/pedidos/[id].ts (Visualização Unificada de Pedido - CORRIGIDO)
import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken' // Necessário para verificar o token

// [NOVO] Função auxiliar para decodificar o token
function lerToken(token: string) {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(base64, 'base64');
    return JSON.parse(buffer.toString('utf-8'));
}

export default defineEventHandler(async (event) => {
    // [NOVO] 1. SEGURANÇA: Checa o cookie e decodifica o usuário
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    // 2. Pega o ID da URL
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório.' });

    try {
        // 3. Pega o Cabeçalho (Filtra pela EMPRESA_ID para segurança)
        const [dados] = await sql`
            SELECT
                p.id, p.data_criacao as quote_date, p.valor_total as total_amount, p.payment_terms, p.status, p.cliente_nome,
                e.nome as empresa_nome
            FROM pedidos p
            LEFT JOIN empresas e ON p.empresa_id = e.id
            WHERE p.id = ${id} AND p.empresa_id = ${usuario.empresa_id} -- <--- CHECAGEM DE SEGURANÇA AQUI
        `

        if (!dados) throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })

        // 4. Pega os Itens
        const itens = await sql`
            SELECT
                nome_produto AS name, quantidade AS quantity, preco_unitario AS unit_price, total_preco AS total_price
            FROM itens_pedido
            WHERE pedido_id = ${id}
        `

        // 5. Junta tudo
        return {
            cabecalho: dados,
            itens: itens
        }

    } catch (e: any) {
        console.error("Erro ao buscar detalhes do pedido:", e);
        // Retorna o erro 404 ou 500 para o frontend
        if (e.statusCode === 404) throw e;
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar dados do pedido.' })
    }
})