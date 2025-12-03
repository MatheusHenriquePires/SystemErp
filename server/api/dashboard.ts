// server/api/dashboard.ts (CORRIGIDO)
import sql from '~/server/database' 
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' // Assumindo que o auth middleware está em vigor

export default defineEventHandler(async (event) => {
    // 1. SEGURANÇA (Manter para evitar 403)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    // Apenas decodifica, pois o middleware já validou a assinatura
    const payload = jwt.decode(cookie) as { empresa_id: number }
    const empresaId = payload.empresa_id 

    // 2. KPIs (Totais)
    const kpis = await sql`
        SELECT 
            COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) as receitas,
            COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) as despesas,
            (COALESCE(SUM(valor), 0)) as saldo_atual
        FROM caixa -- <-- CORRIGIDO AQUI
        WHERE empresa_id = ${empresaId}
    `

    // 3. Lista (Últimos 5)
    const lista = await sql`
        SELECT descricao, valor, data, tipo as categoria -- Renomeando 'tipo' para 'categoria' para compatibilidade com o front
        FROM caixa -- <-- CORRIGIDO AQUI
        WHERE empresa_id = ${empresaId}
        ORDER BY data DESC 
        LIMIT 5
    `

    // 4. GRÁFICO
    const grafico = await sql`
        SELECT 
            TO_CHAR(data, 'Mon') as mes,
            EXTRACT(MONTH FROM data) as numero_mes,
            COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) as receita,
            COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) as despesa
        FROM caixa -- <-- CORRIGIDO AQUI
        WHERE empresa_id = ${empresaId}
        AND data >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY 1, 2
        ORDER BY 2 ASC
    `

    return {
        kpis: kpis[0],
        lista: lista,
        grafico: grafico 
    }
})