// server/api/pedidos.post.ts (COM VALIDAÇÃO SEGURA JWT)
import sql from '~/server/database' 
import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' 

// Variável de ambiente deve ser a MESMA do login.post.ts
const JWT_SECRET = process.env.JWT_SECRET || 'SEGREDO_FORTE_AQUI'; 

export default defineEventHandler(async (event) => {
    
    // 1. AUTENTICAÇÃO E EMPRESA ID (Validação com jwt.verify)
    const cookie = getCookie(event, 'usuario_sessao')
    
    if (!cookie) { 
        throw createError({ statusCode: 401, message: 'Não autorizado. Token de sessão ausente.' }) 
    }

    let payload;
    try {
        // CRÍTICO: jwt.verify() valida a assinatura E a data de expiração (exp).
        payload = jwt.verify(cookie, JWT_SECRET) as { empresa_id: number };
    } catch (e) {
        // Se falhar (assinatura inválida, expirado, etc.), joga 403.
        console.error("ERRO 403: Falha na validação do JWT (Expired/Invalid Signature).", e);
        throw createError({ statusCode: 403, message: 'Sessão inválida ou expirada. Faça login novamente.' });
    }
    
    // Verifica se o payload tem a informação crítica
    if (!payload || !payload.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão sem permissão para esta ação.' });
    }
    
    const empresaId = payload.empresa_id

    // 2. RECEBIMENTO E PREPARAÇÃO DOS DADOS
    const body = await readBody(event)
    const { customerId, paymentTerms, items } = body
    
    const [cliente] = await sql`SELECT nome FROM clientes WHERE id = ${customerId}`
    const clienteNome = cliente ? cliente.nome : 'Cliente Desconhecido';

    let totalAmount = 0
    items.forEach(item => {
        totalAmount += Number(item.quantity) * Number(item.unitPrice)
    })
    
    // 3. TRANSAÇÃO SEGURA
    try {
        const result = await sql.begin(async (sql) => {
            
            // Inserir Cabeçalho (pedidos)
            const [pedido] = await sql`
                INSERT INTO pedidos (
                    cliente_id, empresa_id, cliente_nome, valor_total, status, data_criacao, payment_terms
                )
                VALUES (
                    ${customerId}, ${empresaId}, ${clienteNome}, ${totalAmount}, 'ORCAMENTO', NOW(), ${paymentTerms}
                )
                RETURNING id AS "quoteId"
            `
            
            // Inserir Itens (itens_pedido)
            for (const item of items) {
                const totalItem = Number(item.quantity) * Number(item.unitPrice);
                await sql`
                    INSERT INTO itens_pedido (
                        pedido_id, produto_id, quantidade, preco_unitario, total_preco, nome_produto
                    )
                    VALUES (
                        ${pedido.quoteId}, ${item.materialId || null}, ${item.quantity}, ${item.unitPrice}, ${totalItem}, ${item.materialName}
                    )
                `
            }
            
            return pedido
        })

        return { success: true, quoteId: result.quoteId, total: totalAmount }

    } catch (error) {
        // Se cair aqui, é erro SQL (500), não de autenticação (403)
        console.error("ERRO CRÍTICO NA TRANSAÇÃO SQL (500):", error) 
        throw createError({ statusCode: 500, message: 'Falha ao salvar. Erro interno na transação.' })
    }
})