import postgres from 'postgres'
import { defineEventHandler, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    // body: { pedido_id, entrada, forma_entrada, num_parcelas, valor_parcela, forma_parcelas, data_inicio }

    if (!body.pedido_id) throw createError({ statusCode: 400, message: 'Pedido obrigatório' })

    try {
        // 1. Atualiza Status do Pedido
        await sql`UPDATE pedidos SET status = 'VENDA' WHERE id = ${body.pedido_id}`

        // 2. Limpa lançamentos anteriores
        await sql`DELETE FROM financeiro WHERE pedido_id = ${body.pedido_id}`

        // 3. LANÇA A ENTRADA / PAGAMENTO À VISTA (Se houver valor)
        // Obs: Entrada é considerada "Caixa Realizado" (PAGO)
        if (body.entrada > 0) {
            await sql`
                INSERT INTO financeiro (
                    pedido_id, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento
                ) VALUES (
                    ${body.pedido_id}, 
                    'Entrada / Pagamento Inicial', 
                    ${body.entrada}, 
                    CURRENT_DATE, 
                    CURRENT_DATE, 
                    'PAGO', 
                    ${body.forma_entrada}
                )
            `
        }

        // 4. LANÇA O RESTANTE / PARCELAMENTO (Se houver parcelas)
        // Obs: Parcelas são "A Receber" (PENDENTE)
        if (body.num_parcelas > 0 && body.valor_parcela > 0) {
            const dataBase = new Date(body.data_inicio || new Date());
            
            for (let i = 1; i <= body.num_parcelas; i++) {
                const dataVenc = new Date(dataBase);
                // Se a entrada foi 0 e é a 1ª parcela, usa a data exata. Se não, soma meses.
                // Lógica simples: data definida + (i - 1) meses
                dataVenc.setMonth(dataVenc.getMonth() + (i - 1));

                await sql`
                    INSERT INTO financeiro (
                        pedido_id, descricao, valor, data_vencimento, status, forma_pagamento
                    ) VALUES (
                        ${body.pedido_id}, 
                        ${`Parcela ${i}/${body.num_parcelas}`}, 
                        ${body.valor_parcela}, 
                        ${dataVenc.toISOString().split('T')[0]}, 
                        'PENDENTE', 
                        ${body.forma_parcelas}
                    )
                `
            }
        }

        return { success: true, message: 'Financeiro gerado com sucesso!' }

    } catch (e: any) {
        throw createError({ statusCode: 500, message: e.message })
    }
})