// server/api/dashboard.ts (FINAL - CORRIGIDO NOMES DE COLUNAS)
import sql from '~/server/database' 
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    // 1. SEGURANÇA
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    const payload = jwt.decode(cookie) as { empresa_id: number }
    const empresaId = payload.empresa_id 

    // --- Nome da Tabela Financeira ---
    const FINANCIAL_TABLE = 'caixa'; 

    // 2. KPIs (Totais)
    const kpis = await sql`
        SELECT 
            COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) as receitas,
            COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) as despesas,
            (COALESCE(SUM(valor), 0)) as saldo_atual
        FROM ${sql(FINANCIAL_TABLE)}
        WHERE empresa_id = ${empresaId}
    `

    // 3. Lista (Últimos 5) - Usa data_movimento e mapeia tipo para categoria
    const lista = await sql`
        SELECT 
            descricao, 
            valor, 
            data_movimento as data, -- <-- CORREÇÃO
            tipo as categoria       -- <-- CORREÇÃO
        FROM ${sql(FINANCIAL_TABLE)}
        WHERE empresa_id = ${empresaId}
        ORDER BY data_movimento DESC 
        LIMIT 5
    `

    // 4. GRÁFICO
    const grafico = await sql`
        SELECT 
            TO_CHAR(data_movimento, 'Mon') as mes, -- <-- CORREÇÃO
            EXTRACT(MONTH FROM data_movimento) as numero_mes, -- <-- CORREÇÃO
            COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) as receita,
            COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) as despesa
        FROM ${sql(FINANCIAL_TABLE)}
        WHERE empresa_id = ${empresaId}
        AND data_movimento >= CURRENT_DATE - INTERVAL '6 months' -- <-- CORREÇÃO
        GROUP BY 1, 2
        ORDER BY 2 ASC
    `

    return {
        kpis: kpis[0],
        lista: lista,
        grafico: grafico 
    }
})