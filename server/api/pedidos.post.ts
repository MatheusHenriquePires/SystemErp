// server/api/pedidos.post.ts (Criação de Novo Pedido/Orçamento)
import sql from '~/server/database' 
import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' // Assumindo que você está usando 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    // 1. AUTENTICAÇÃO E VERIFICAÇÃO DA SESSÃO (CORREÇÃO DE 403)
    const cookie = getCookie(event, 'usuario_sessao')
    
    // Verifica se o cookie chegou vazio/ausente
    if (!cookie || cookie.length < 10) { 
        console.error("ERRO 401: Cookie de sessão ausente ou vazio.");
        throw createError({ statusCode: 401, message: 'Não autorizado. O token não foi enviado.' }); 
    }

    let payload;
    try {
        // Tenta decodificar o token
        payload = jwt.decode(cookie) as { empresa_id: number }
    } catch (e) {
        // Captura erro se o token for malformado e o decode falhar
        console.error("ERRO 403: Falha na decodificação do JWT.", e);
        throw createError({ statusCode: 403, message: 'Sessão malformada ou inválida.' });
    }
    
    // Verifica se o payload decodificado tem a informação crítica
    if (!payload || !payload.empresa_id) {
        console.error("ERRO 403: Payload decodificado, mas sem 'empresa_id'. Token expirado ou inválido.");
        throw createError({ statusCode: 403, message: 'Sessão expirada ou sem permissão.' });
    }
    
    const empresaId = payload.empresa_id

    // 2. RECEBIMENTO E PREPARAÇÃO DOS DADOS
    const body = await readBody(event)
    const { customerId, paymentTerms, items } = body
    
    // Busca o nome do cliente
    const [cliente] = await sql`SELECT nome FROM clientes WHERE id = ${customerId}`
    const clienteNome = cliente ? cliente.nome : 'Cliente Desconhecido';

    let totalAmount = 0
    items.forEach(item => {
        totalAmount += Number(item.quantity) * Number(item.unitPrice)
    })
    
    // 3. TRANSAÇÃO SEGURA (Fluxo principal)
    try {
        const result = await sql.begin(async (sql) => {
            
            // Inserir Cabeçalho (pedidos)
            const [pedido] = await sql`
                INSERT INTO pedidos (cliente_id, empresa_id, cliente_nome, valor_total, status, data_criacao, payment_terms)
                VALUES (${customerId}, ${empresaId}, ${clienteNome}, ${totalAmount}, 'ORCAMENTO', NOW(), ${paymentTerms})
                RETURNING id AS "quoteId"
            `
            
            // Inserir Itens (itens_pedido)
            for (const item of items) {
                const totalItem = Number(item.quantity) * Number(item.unitPrice);
                await sql`
                    INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, total_preco, nome_produto)
                    VALUES (
                        ${pedido.quoteId},
                        ${item.materialId || null},
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
        // Este log captura falhas SQL ou de lógica interna
        console.error("ERRO CRÍTICO NA TRANSAÇÃO SQL (500):", error) 
        throw createError({ statusCode: 500, message: 'Falha ao salvar. Erro interno na transação.' })
    }
})