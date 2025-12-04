// server/api/pedidos/[id].ts (Visualização Unificada de Pedido - FINAL)
import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken' // Necessário para verificar o token

// Função auxiliar para decodificar o token (Payload)
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
    // 1. SEGURANÇA: Checa o cookie e decodifica o usuário
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
        // 3. Pega o Cabeçalho
        const [dados] = await sql`
            SELECT
                p.id, p.data_criacao as quote_date, p.valor_total as total_amount, p.payment_terms, p.status, p.cliente_nome,
                e.nome as empresa_nome
            FROM pedidos p
            LEFT JOIN empresas e ON p.empresa_id = e.id
            WHERE p.id = ${id} AND p.empresa_id = ${usuario.empresa_id}
        `

        if (!dados) throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })

        // 4. Pega os Itens - [ALTERADO PARA INCLUIR COMODO]
        // Se a API retornar um objeto simples (sem 'cabecalho'), o frontend consegue lidar.
        const itens = await sql`
            SELECT
                nome_produto AS name, quantidade AS quantity, preco_unitario AS unit_price, total_preco AS total_price, comodo -- CAMPO ADICIONADO AQUI
            FROM itens_pedido
            WHERE pedido_id = ${id}
        `

        // 5. Junta tudo
        // A API de Edição de Markup espera que as colunas 'markup_percent' e 'final_total' 
        // estejam no objeto 'dados' para funcionar. Vamos incluir o retorno aqui.
        const [markupInfo] = await sql`
            SELECT markup_percent, final_total FROM pedidos WHERE id = ${id}
        `

        return {
            ...dados, // Retornamos o cabeçalho plano
            ...markupInfo, // Retornamos o markup plano
            itens: itens
        }

    } catch (e: any) {
        console.error("Erro ao buscar detalhes do pedido:", e);
        if (e.statusCode === 404) throw e;
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar dados do pedido.' })
    }
})