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
    
    // [CORREÇÃO]: Recebe ambos os campos (percentual para DB e fator para cálculo)
    const percentToSave = parseFloat(body.markup_percent); // O percentual que o frontend calculou
    const fatorMultiplicador = parseFloat(body.fator_multiplicador); // O fator que o usuário digitou

    // 2. Validação: Checa o ID e o FATOR MULTIPLICADOR (o valor crítico)
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
                markup_percent = ${percentToSave}, /* Salva o percentual (Ex: 20) */
                final_total = ${finalTotal}         /* Salva o total calculado com o fator */
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id, final_total, markup_percent
        `

        return { success: true, updated }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: `Erro ao aplicar Fator Multiplicador: ${error.message}` })
    }
})