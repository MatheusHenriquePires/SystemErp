import postgres from 'postgres'
import { defineEventHandler, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.pedido_id) throw createError({ statusCode: 400, message: 'Pedido obrigatório' })

    try {
        // 1. Atualiza Status do Pedido
        await sql`UPDATE pedidos SET status = 'VENDA' WHERE id = ${body.pedido_id}`

        // 2. Limpa lançamentos anteriores deste pedido
        await sql`DELETE FROM financeiro WHERE pedido_id = ${body.pedido_id}`

        // 3. Lança Entrada (Já como PAGO)
        if (body.entrada > 0) {
            await sql`
                INSERT INTO financeiro (pedido_id, descricao, valor, data_vencimento, data_pagamento, status, forma_pagamento)
                VALUES (${body.pedido_id}, 'Entrada (Sinal)', ${body.entrada}, CURRENT_DATE, CURRENT_DATE, 'PAGO', 'PIX/DINHEIRO')
            `
        }

        // 4. Lança Parcelas (Como PENDENTE)
        if (body.num_parcelas > 0) {
            const hoje = new Date(body.data_inicio || new Date());
            for (let i = 1; i <= body.num_parcelas; i++) {
                const dataVenc = new Date(hoje);
                dataVenc.setMonth(dataVenc.getMonth() + (i - 1));

                await sql`
                    INSERT INTO financeiro (pedido_id, descricao, valor, data_vencimento, status, forma_pagamento)
                    VALUES (${body.pedido_id}, ${`Parcela ${i}/${body.num_parcelas}`}, ${body.valor_parcela}, ${dataVenc.toISOString().split('T')[0]}, 'PENDENTE', 'BOLETO')
                `
            }
        }

        return { success: true }
    } catch (e: any) {
        throw createError({ statusCode: 500, message: e.message })
    }
})