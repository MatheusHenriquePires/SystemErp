export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const percentToSave = Number(body.markup_percent)
    const fatorMultiplicador = Number(body.fator_multiplicador ?? 1)

    if (
        !id ||
        !usuario ||
        isNaN(percentToSave) ||
        isNaN(fatorMultiplicador) ||
        fatorMultiplicador < 1
    ) {
        throw createError({
            statusCode: 400,
            message: 'markup_percent ou fator_multiplicador inválidos'
        })
    }

    try {
        const [pedido] = await sql`
            SELECT valor_total, total 
            FROM pedidos 
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
        `

        const originalTotal = Number(pedido?.valor_total || pedido?.total)

        const finalTotal = originalTotal * fatorMultiplicador

        const [updated] = await sql`
            UPDATE pedidos
            SET 
                markup_percent = ${percentToSave.toFixed(2)}, 
                final_total = ${finalTotal.toFixed(2)}         
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id, final_total, markup_percent
        `

        return { success: true, updated }

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: 'Erro de Servidor: Falha ao salvar no DB.'
        })
    }
})
