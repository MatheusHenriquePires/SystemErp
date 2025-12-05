import postgres from 'postgres'
import { defineEventHandler, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    const body = await readBody(event) // Espera { id: 123 }

    if (!body.id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

    try {
        // 1. Apaga registros dependentes (Financeiro e Itens)
        await sql`DELETE FROM financeiro WHERE pedido_id = ${body.id}`
        await sql`DELETE FROM pedidos_itens WHERE pedido_id = ${body.id}` // Ou 'itens_pedido', confira seu banco
        
        // 2. Apaga o Pedido Principal
        await sql`DELETE FROM pedidos WHERE id = ${body.id}`

        return { success: true, message: 'Pedido excluído com sucesso.' }
    } catch (error: any) {
        console.error('Erro ao excluir:', error)
        throw createError({ statusCode: 500, message: 'Erro ao excluir pedido.' })
    }
})