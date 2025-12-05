import postgres from 'postgres'
import { defineEventHandler, readBody } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    const body = await readBody(event) // { id }

    try {
        await sql`
            UPDATE financeiro 
            SET status = 'PAGO', data_pagamento = CURRENT_DATE 
            WHERE id = ${body.id}
        `
        return { success: true }
    } catch (error) {
        throw createError({ statusCode: 500, message: 'Erro ao dar baixa' })
    }
})
