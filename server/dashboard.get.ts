import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any

    // 1. Busca Vendas de Hoje
    // Forçamos o CAST para numeric para garantir que o banco não devolva texto
    const [vendasHoje] = await sql`
      SELECT COALESCE(SUM(valor_total::numeric), 0) as total
      FROM pedidos
      WHERE empresa_id = ${user.empresa_id}
      AND status IN ('VENDA', 'PAGO')
      AND data_criacao::date = CURRENT_DATE
    `

    // 2. Busca Faturamento do Mês Atual
    const [faturamentoMes] = await sql`
      SELECT COALESCE(SUM(valor_total::numeric), 0) as total
      FROM pedidos
      WHERE empresa_id = ${user.empresa_id}
      AND status IN ('VENDA', 'PAGO')
      AND data_criacao >= date_trunc('month', CURRENT_DATE)
    `

    // 3. Conta Orçamentos Pendentes
    const [orcamentosAbertos] = await sql`
      SELECT COUNT(*)::int as qtd
      FROM pedidos
      WHERE empresa_id = ${user.empresa_id}
      AND status IN ('Orçamento', 'ORÇAMENTO', 'PROPOSTA')
    `

    // 4. Dados para o Gráfico (Últimos 7 dias)
    const desempenho = await sql`
        SELECT 
            to_char(data_criacao, 'DD/MM') as dia,
            COALESCE(SUM(valor_total::numeric), 0) as total
        FROM pedidos
        WHERE empresa_id = ${user.empresa_id}
        AND status IN ('VENDA', 'PAGO')
        AND data_criacao >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY 1, data_criacao::date
        ORDER BY data_criacao::date ASC
    `

    // ✅ CONVERSÃO FINAL DE SEGURANÇA
    // O banco pode retornar string ("1000.50"), aqui garantimos que vira Number
    return {
      vendas_hoje: Number(vendasHoje?.total || 0),
      faturamento_mes: Number(faturamentoMes?.total || 0),
      orcamentos_abertos: Number(orcamentosAbertos?.qtd || 0),
      grafico: desempenho.map(d => ({
        dia: d.dia,
        total: Number(d.total || 0)
      }))
    }

  } catch (e: any) {
    console.error("Erro no dashboard:", e)
    // Retorno seguro em caso de falha total
    return { vendas_hoje: 0, faturamento_mes: 0, orcamentos_abertos: 0, grafico: [] }
  }
})