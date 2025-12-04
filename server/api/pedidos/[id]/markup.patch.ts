import postgres from 'postgres'
import { defineEventHandler, getCookie, createError, getRouterParam, readBody } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

function lerToken(token: string) { /* ... (função mantida) ... */ }

export default defineEventHandler(async (event) => {
    // ... (segurança e ID)

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    const percentToSave = parseFloat(body.markup_percent); 
    const fatorMultiplicador = parseFloat(body.fator_multiplicador); 

    // A validação que precisa ser satisfeita:
    if (!id || !usuario || isNaN(fatorMultiplicador) || fatorMultiplicador < 1) {
        throw createError({ statusCode: 400, message: 'Dados incompletos ou Fator Multiplicador inválido (deve ser >= 1).' })
    }

    try {
        // 3. Busca o valor original
        const [pedido] = await sql`
            SELECT valor_total, total, status
            FROM pedidos 
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
        `

        if (!pedido) {
             throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })
        }
        
        const originalTotal = parseFloat(pedido.valor_total || pedido.total)
        
        // 4. Calcula o Novo Total (usando o fator)
        const finalTotal = originalTotal * fatorMultiplicador;

        // 5. Executa a atualização
        const [updated] = await sql`
            UPDATE pedidos
            SET 
                markup_percent = ${percentToSave}, 
                final_total = ${finalTotal}         
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id, final_total, markup_percent
        `

        return { success: true, updated }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: `Erro ao aplicar Fator Multiplicador: ${error.message}` })
    }
})