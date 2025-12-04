import postgres from 'postgres'
import { defineEventHandler, getCookie, createError, getRouterParam, readBody } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

function lerToken(token: string) { /* ... (função mantida) ... */ }

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    const usuario = lerToken(cookie)

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    const percentToSave = parseFloat(body.markup_percent);
    
    // [CORREÇÃO FINAL AQUI]: Coalesce para 1.0 se o valor for nulo/vazio, eliminando a falha NaN
    const fatorMultiplicador = parseFloat(body.fator_multiplicador || 1.0); 

    // 2. Validação (Agora deve passar se o fator for 1.0)
    if (!id || !usuario || isNaN(fatorMultiplicador) || fatorMultiplicador < 1) {
        throw createError({ statusCode: 400, message: 'Dados incompletos ou Fator Multiplicador inválido (deve ser >= 1).' })
    }

    try {
        // ... (Busca e cálculo mantidos) ...
        const originalTotal = parseFloat(pedido.valor_total || pedido.total)
        const finalTotal = originalTotal * fatorMultiplicador;

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
        console.error("ERRO FATAL NA ATUALIZAÇÃO SQL:", error.message);
        throw createError({ statusCode: 500, message: `Erro de Servidor: Falha ao salvar no DB.` })
    }
})