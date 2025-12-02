// server/api/materials/[id].patch.ts
import sql from '~/server/database'

export default defineEventHandler(async (event) => {
    // Pega o ID do produto da URL e o novo markup do formulário
    const id = getRouterParam(event, 'id')
    const { markup_percent } = await readBody(event)

    if (!id || markup_percent === undefined) {
        throw createError({ statusCode: 400, message: 'Dados inválidos.' })
    }
    
    const markup = parseFloat(markup_percent)
    
    // 1. Pega o preço base do parceiro e o preço final atual
    const [material] = await sql`SELECT partner_price, final_price FROM produtos WHERE id = ${id}`
    
    if (!material) {
        throw createError({ statusCode: 404, message: 'Material não encontrado.' })
    }

    // 2. Calcula o novo preço final: preco_parceiro * (1 + markup/100)
    const partnerPrice = parseFloat(material.partner_price)
    const finalPrice = partnerPrice * (1 + markup / 100)

    // 3. Atualiza o banco com a nova margem e o preço final
    const [updatedMaterial] = await sql`
        UPDATE produtos
        SET markup_percent = ${markup},
            final_price = ${finalPrice}
        WHERE id = ${id}
        RETURNING *
    `

    return updatedMaterial
})