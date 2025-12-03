// server/api/pedidos.post.ts (Criação de Novo Pedido/Orçamento)
import sql from '~/server/database' 
import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' 

export default defineEventHandler(async (event) => {
    // 1. AUTENTICAÇÃO E EMPRESA ID (Correção para erro 'Cannot read properties of null')
    const cookie = getCookie(event, 'usuario_sessao')
    
    if (!cookie) { 
        // 401: Falta o token
        throw createError({ statusCode: 401, message: 'Não autorizado. Cookie de sessão ausente.' }) 
    }

    const payload = jwt.decode(cookie) as { empresa_id: number }
    
    // CORREÇÃO CRÍTICA: Se a decodificação falhar (token inválido/expirado), o payload será null.
    if (!payload || !payload.empresa_id) {
        console.error("ERRO DE AUTENTICAÇÃO: Payload JWT inválido ou expirado.");
        // 403: Token existe, mas é inválido ou expirou
        throw createError({ statusCode: 403, message: 'Sessão inválida ou expirada. Faça login novamente.' });
    }
    
    const empresaId = payload.empresa_id

    // 2. RECEBIMENTO E PREPARAÇÃO DOS DADOS
    const body = await readBody(event)
    const { customerId, paymentTerms, items } = body
    
    // Busca o nome do cliente (necessário para o cabeçalho)
    const [cliente] = await sql`SELECT nome FROM clientes WHERE id = ${customerId}`
    const clienteNome = cliente ? cliente.nome : 'Cliente Desconhecido';

    let totalAmount = 0
    items.forEach(item => {
        totalAmount += Number(item.quantity) * Number(item.unitPrice)
    })
    
    // 3. TRANSAÇÃO SEGURA (Atomicidade Garantida)
    try {
        const result = await sql.begin(async (sql) => {
            
            // 3.1. Inserir Cabeçalho (pedidos)
            const [pedido] = await sql`
                INSERT INTO pedidos (
                    cliente_id, 
                    empresa_id,
                    cliente_nome,
                    valor_total, 
                    status, 
                    data_criacao,
                    payment_terms
                )
                VALUES (
                    ${customerId},
                    ${empresaId},
                    ${clienteNome},
                    ${totalAmount},
                    'ORCAMENTO', -- Status inicial
                    NOW(),
                    ${paymentTerms}
                )
                RETURNING id AS "quoteId"
            `
            
            // 3.2. Inserir Itens (itens_pedido)
            for (const item of items) {
                const totalItem = Number(item.quantity) * Number(item.unitPrice);
                await sql`
                    INSERT INTO itens_pedido (
                        pedido_id, 
                        produto_id, 
                        quantidade, 
                        preco_unitario, 
                        total_preco,
                        nome_produto
                    )
                    VALUES (
                        ${pedido.quoteId},
                        ${item.materialId || null}, -- produto_id pode ser NULL para itens avulsos
                        ${item.quantity},
                        ${item.unitPrice},
                        ${totalItem},
                        ${item.materialName}
                    )
                `
            }
            
            return pedido
        })

        return { success: true, quoteId: result.quoteId, total: totalAmount }

    } catch (error) {
        // Este log é essencial para debug em caso de falha SQL/DB
        console.error("ERRO CRÍTICO NA TRANSAÇÃO SQL:", error) 
        throw createError({ statusCode: 500, message: 'Falha ao salvar. Erro interno na transação.' })
    }
})