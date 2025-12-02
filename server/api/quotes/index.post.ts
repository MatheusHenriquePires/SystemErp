import sql from '~/server/database'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. AUTENTICAÇÃO
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) { throw createError({ statusCode: 401, message: 'Não autorizado' }) }
    const usuario = JSON.parse(cookie)
    const empresaId = usuario.empresa_id

    // 2. RECEBIMENTO DOS DADOS
    const body = await readBody(event)
    const { customerId, paymentTerms, items } = body

    // Log para Debug (Veja no terminal do Easypanel se der erro)
    console.log('Tentando criar orçamento:', { customerId, paymentTerms, itemsCount: items?.length })

    // Validação básica
    if (!customerId) {
        throw createError({ statusCode: 400, message: 'Cliente não selecionado.' })
    }
    if (!items || items.length === 0) {
        throw createError({ statusCode: 400, message: 'O orçamento não tem itens.' })
    }

    // 3. CÁLCULO DO TOTAL
    let totalAmount = 0
    items.forEach(item => {
        totalAmount += Number(item.quantity) * Number(item.unitPrice)
    })
    
    // 4. TRANSAÇÃO NO BANCO
    try {
        const result = await sql.begin(async (sql) => {
            // Inserir Cabeçalho
            const [quote] = await sql`
                INSERT INTO quotes (customer_id, total_amount, payment_terms, status)
                VALUES (${customerId}, ${totalAmount}, ${paymentTerms}, 'draft')
                RETURNING id
            `
            
            // Inserir Itens
            for (const item of items) {
                await sql`
                    INSERT INTO quote_items (quote_id, material_id, name, quantity, unit_price, total_price)
                    VALUES (
                        ${quote.id},
                        ${item.materialId || null}, -- Pode ser nulo se for item avulso
                        ${item.materialName},
                        ${item.quantity},
                        ${item.unitPrice},
                        ${item.quantity * item.unitPrice}
                    )
                `
            }
            
            return quote
        })

        return { success: true, quoteId: result.id, total: totalAmount }

    } catch (error) {
        console.error("ERRO SQL:", error) // Isso vai mostrar o erro real no log
        throw createError({ statusCode: 500, message: 'Erro ao salvar no banco de dados.' })
    }
})