import postgres from 'postgres'
import { defineEventHandler, getCookie, createError, getRouterParam, readBody } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

function lerToken(token: string) { /* ... (função mantida) ... */ }

export default defineEventHandler(async (event) => {
    // 1. Segurança e IDs
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    const usuario = lerToken(cookie)

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    // [NOVO]: Espera o FATOR (1.2) do Frontend
    const fatorMultiplicador = parseFloat(body.fator_multiplicador) 

    // [VALIDAÇÃO]
    if (!id || !usuario || isNaN(fatorMultiplicador) || fatorMultiplicador < 1) {
        throw createError({ statusCode: 400, message: 'Dados incompletos ou Fator Multiplicador inválido (deve ser >= 1).' })
    }

    try {
        // 2. Busca o valor original
        const [pedido] = await sql`
            SELECT valor_total, total, status
            FROM pedidos 
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
        `

        if (!pedido) {
             throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })
        }
        
        const originalTotal = parseFloat(pedido.valor_total || pedido.total)
        
        // 3. Calcula o Novo Total e o Percentual para Salvar
        const percentToSave = (fatorMultiplicador - 1) * 100; // Ex: (1.2 - 1) * 100 = 20
        const finalTotal = originalTotal * fatorMultiplicador;

        // 4. Executa a atualização
        const [updated] = await sql`
            UPDATE pedidos
            SET 
                markup_percent = ${percentToSave}, /* Salva o percentual (20%) */
                final_total = ${finalTotal}         /* Salva o total calculado com o fator (R$ * 1.2) */
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id, final_total, markup_percent
        `

        return { success: true, updated }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: `Erro ao aplicar Fator Multiplicador: ${error.message}` })
    }
})