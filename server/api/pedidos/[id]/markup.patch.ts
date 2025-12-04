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
    
    // [CORREÇÃO FINAL AQUI]: Coalesce para "1.0" antes de chamar parseFloat
    const rawFator = body.fator_multiplicador || "1.0";
    const fatorMultiplicador = parseFloat(rawFator); 

    // 2. Validação FINAL: Agora deve passar se o valor for 1.0
    if (!id || !usuario || isNaN(fatorMultiplicador) || fatorMultiplicador < 1.0) {
        throw createError({ statusCode: 400, message: 'Dados incompletos ou Fator Multiplicador inválido (deve ser >= 1).' })
    }

    try {
        // ... (Busca original total)
        const [pedido] = await sql`...` 
        const originalTotal = parseFloat(pedido.valor_total || pedido.total)
        
        // 3. Cálculo
        const finalTotal = originalTotal * fatorMultiplicador;

        // 4. Executa a atualização (toFixed para segurança)
        const [updated] = await sql`
            UPDATE pedidos
            SET 
                markup_percent = ${percentToSave.toFixed(2)}, 
                final_total = ${finalTotal.toFixed(2)}         
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id }
            RETURNING id, final_total, markup_percent
        `

        return { success: true, updated }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: `Erro de Servidor: Falha ao salvar no DB.` })
    }
})