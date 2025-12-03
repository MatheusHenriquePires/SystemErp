// server/api/pedidos/[id].ts (Visualização Unificada de Pedido)
import sql from '~/server/database'
import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // Pega o ID da URL
    const id = getRouterParam(event, 'id')

    if (!id) throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório.' });

    try {
        // 1. Pega o Cabeçalho (da tabela PEDIDOS)
        const [dados] = await sql`
            SELECT 
                p.id, 
                p.data_criacao as quote_date, -- Mapeado para o nome que o front espera
                p.valor_total as total_amount,  -- Mapeado
                p.payment_terms,
                p.status,
                p.cliente_nome,
                e.nome as empresa_nome
            FROM pedidos p
            LEFT JOIN empresas e ON p.empresa_id = e.id
            WHERE p.id = ${id}
        `

        if (!dados) throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })

        // 2. Pega os Itens (da tabela ITENS_PEDIDO)
        const itens = await sql`
    SELECT 
        nome_produto AS name, 
        quantidade AS quantity, 
        preco_unitario AS unit_price, 
        total_preco AS total_price
    FROM itens_pedido -- <--- BUSCA NA TABELA CORRETA
    WHERE pedido_id = ${id}
`

        // 3. Junta tudo num pacote limpo para o front
        return {
            cabecalho: dados,
            itens: itens
        }

    } catch (e) {
        console.error("Erro ao buscar detalhes do pedido:", e);
        throw createError({ statusCode: 500, message: 'Erro interno ao buscar dados do pedido.' })
    }
})