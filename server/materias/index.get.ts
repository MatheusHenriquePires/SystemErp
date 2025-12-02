// server/api/materials/index.get.ts
import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // [Autenticação omitida por brevidade, mas deve ser usada!]
    // const { empresa_id } = getAuthUser(event);

    const materials = await sql`
        SELECT 
            id, name, unit, partner_price, markup_percent, final_price
        FROM produtos
        ORDER BY name ASC
    `
    return materials
})