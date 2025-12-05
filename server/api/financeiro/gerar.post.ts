import postgres from 'postgres'
import { defineEventHandler, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    // body espera: { pedido_id, entrada, forma_entrada, num_parcelas, valor_parcela, forma_parcelas, data_inicio }

    if (!body.pedido_id) throw createError({ statusCode: 400, message: 'Pedido obrigatório' })

    try {
        // 1. Atualiza Status do Pedido para VENDA
        await sql`UPDATE pedidos SET status = 'VENDA' WHERE id = ${body.pedido_id}`

        // 2. Limpa lançamentos anteriores (para evitar duplicidade ao regravar)
        await sql`DELETE FROM financeiro WHERE pedido_id = ${body.pedido_id}`

        // 3. Lança a ENTRADA (Se houver valor > 0)
        if (body.entrada > 0) {
            await sql`
                INSERT INTO financeiro (
                    pedido_id, 
                    descricao, 
                    valor, 
                    data_vencimento, 
                    data_pagamento, 
                    status, 
                    forma_pagamento
                ) VALUES (
                    ${body.pedido_id}, 
                    'Entrada (Sinal)', 
                    ${body.entrada}, 
                    CURRENT_DATE, 
                    CURRENT_DATE, 
                    'PAGO', 
                    ${body.forma_entrada || 'OUTROS'}
                )
            `
        }

        // 4. Lança as PARCELAS
        if (body.num_parcelas > 0) {
            const hoje = new Date(body.data_inicio || new Date());
            
            for (let i = 1; i <= body.num_parcelas; i++) {
                // Calcula vencimento: Data Escolhida + Meses
                const dataVenc = new Date(hoje);
                dataVenc.setMonth(dataVenc.getMonth() + (i - 1));

                await sql`
                    INSERT INTO financeiro (
                        pedido_id, 
                        descricao, 
                        valor, 
                        data_vencimento, 
                        status, 
                        forma_pagamento
                    ) VALUES (
                        ${body.pedido_id}, 
                        ${`Parcela ${i}/${body.num_parcelas}`}, 
                        ${body.valor_parcela}, 
                        ${dataVenc.toISOString().split('T')[0]}, 
                        'PENDENTE', 
                        ${body.forma_parcelas || 'BOLETO'}
                    )
                `
            }
        }

        return { success: true, message: 'Financeiro gerado com detalhes de pagamento!' }

    } catch (e: any) {
        throw createError({ statusCode: 500, message: e.message })
    }
})