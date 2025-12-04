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
    
    const percentToSave = parseFloat(body.markup_percent);
    const fatorMultiplicador = parseFloat(body.fator_multiplicador); 

    // 2. Validação (Passa, pois corrigimos o Frontend)
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
        
        // 4. Calcula o Novo Total
        const finalTotal = originalTotal * fatorMultiplicador;

        // [CORREÇÃO CRÍTICA]: Formata os números com 2 casas decimais antes de enviar ao SQL
        const finalTotalFixed = finalTotal.toFixed(2);
        const percentToSaveFixed = percentToSave.toFixed(2);

        // 5. Executa a atualização (Usando os valores fixos)
        const [updated] = await sql`
            UPDATE pedidos
            SET 
                markup_percent = ${percentToSaveFixed}, 
                final_total = ${finalTotalFixed}         
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id, final_total, markup_percent
        `

        return { success: true, updated }

    } catch (error: any) {
        // Imprime o erro SQL real nos logs do servidor para diagnóstico futuro
        console.error("ERRO FATAL NA ATUALIZAÇÃO SQL:", error.message);
        throw createError({ statusCode: 500, message: `Erro de Servidor: Falha ao salvar no DB.` })
    }
})