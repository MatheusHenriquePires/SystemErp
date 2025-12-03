// server/api/pedidos.post.ts (Criação de Novo Pedido/Orçamento)
import sql from '~/server/database' 
import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' 

export default defineEventHandler(async (event) => {
    // 1. AUTENTICAÇÃO E EMPRESA ID
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    const payload = jwt.decode(cookie) as { empresa_id: number }
    const empresaId = payload.empresa_id

    // 2. RECEBIMENTO E PREPARAÇÃO DOS DADOS
    const body = await readBody(event)
    const { customerId, paymentTerms, items } = body
    
    // Supondo que você precisa buscar o nome do cliente se não for enviado
    const [cliente] = await sql`SELECT nome FROM clientes WHERE id = ${customerId}`
    const clienteNome = cliente ? cliente.nome : 'Cliente Não Encontrado';

    let totalAmount = 0
    items.forEach(item => {
        totalAmount += Number(item.quantity) * Number(item.unitPrice)
    })
    
    // 3. TRANSAÇÃO SEGURA
    try {
        const result = await sql.begin(async (sql) => {
            
            // Inserir Cabeçalho (Tabela UNIFICADA: pedidos)
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
                    'ORCAMENTO', -- Status inicial correto
                    NOW(),
                    ${paymentTerms}
                )
                RETURNING id
            `
            
            // Inserir Itens (Tabela UNIFICADA: itens_pedido)
            for (const item of items) {
                const totalItem = Number(item.quantity) * Number(item.unitPrice);
                await sql`
                    INSERT INTO itens_pedido (
                        pedido_id, 
                        produto_id, 
                        quantidade, 
                        preco_unitario, 
                        total_preco,
                        nome_produto -- Se você precisar de um campo de nome customizado no item
                    )
                    VALUES (
                        ${pedido.id},
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

        return { success: true, quoteId: result.id, total: totalAmount }

    } catch (error) {
        console.error("ERRO CRÍTICO NA CRIAÇÃO DO PEDIDO:", error) 
        throw createError({ statusCode: 500, message: 'Falha ao salvar. Verifique o console do servidor para detalhes.' })
    }
})