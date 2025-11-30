import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    // 1. SEGURANÇA
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    const usuario = JSON.parse(cookie)
    const empresaId = usuario.empresa_id

    // 2. KPIs (Totais)
    const kpis = await sql`
        SELECT 
            COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) as receitas,
            COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) as despesas,
            (COALESCE(SUM(valor), 0)) as saldo_atual
        FROM despesas 
        WHERE empresa_id = ${empresaId}
    `

    // 3. Lista (Últimos 5)
    const lista = await sql`
        SELECT descricao, valor, data, categoria 
        FROM despesas 
        WHERE empresa_id = ${empresaId}
        ORDER BY data DESC 
        LIMIT 5
    `

    // 4. GRÁFICO (NOVO! 📊)
    // Agrupa por mês e soma receitas/despesas
    const grafico = await sql`
        SELECT 
            TO_CHAR(data, 'Mon') as mes, -- Ex: "Nov", "Dez"
            EXTRACT(MONTH FROM data) as numero_mes,
            COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) as receita,
            COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) as despesa
        FROM despesas
        WHERE empresa_id = ${empresaId}
          AND data >= CURRENT_DATE - INTERVAL '6 months' -- Últimos 6 meses
        GROUP BY 1, 2
        ORDER BY 2 ASC
    `

    return {
        kpis: kpis[0],
        lista: lista,
        grafico: grafico // Mandando os dados reais pro front!
    }
})