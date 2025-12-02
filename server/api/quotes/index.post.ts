// server/api/quotes/index.post.ts
import sql from '~/server/database'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. AUTENTICAÇÃO E PREPARAÇÃO
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) { throw createError({ statusCode: 401, message: 'Não autorizado' }) }
    const usuario = JSON.parse(cookie)
    const empresaId = usuario.empresa_id

    const { customerId, paymentTerms, items } = await readBody(event)

    if (!customerId || !items || items.length === 0) {
        throw createError({ statusCode: 400, message: 'Dados insuficientes para o orçamento.' })
    }

    // 2. CÁLCULO TOTAL
    let totalAmount = 0
    items.forEach(item => {
        totalAmount += item.quantity * item.unitPrice
    })
    
    let quoteId: number | null = null;

    try {
        // INICIA TRANSAÇÃO (Garante que se falhar no meio, nada é salvo)
        await sql.begin(async (sql) => {

            // 3. INSERIR O CABEÇALHO (MASTER)
            const [quoteResult] = await sql`
                INSERT INTO quotes (customer_id, total_amount, payment_terms)
                VALUES (${customerId}, ${totalAmount}, ${paymentTerms})
                RETURNING id
            `;
            quoteId = quoteResult.id;

            // 4. INSERIR OS ITENS DA VENDA (DETAIL)
            for (const item of items) {
                const itemTotal = item.quantity * item.unitPrice;
                await sql`
                    INSERT INTO quote_items (quote_id, material_id, name, quantity, unit_price, total_price)
                    VALUES (
                        ${quoteId},
                        ${item.materialId},
                        ${item.materialName},
                        ${item.quantity},
                        ${item.unitPrice},
                        ${itemTotal}
                    )
                `;
            }

            // 5. REGISTRAR NO FINANCEIRO (Opcional, mas crucial para o ERP)
            await sql`
                INSERT INTO despesas (descricao, valor, categoria, empresa_id)
                VALUES (
                    ${'Orçamento #' + quoteId},
                    ${totalAmount},
                    'Vendas - Orçamento',
                    ${empresaId}
                )
            `;
        });
        
        return { success: true, quoteId: quoteId, total: totalAmount }
        
    } catch (error) {
        console.error("Erro na Transação de Orçamento:", error);
        throw createError({ statusCode: 500, message: 'Erro ao processar o orçamento. A transação foi cancelada.' })
    }
})