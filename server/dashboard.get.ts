import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any

    // 1. Busca Vendas de Hoje (Status VENDA ou PAGO, Data = Hoje)
    const [vendasHoje] = await sql`
      SELECT COALESCE(SUM(valor_total), 0) as total
      FROM pedidos
      WHERE empresa_id = ${user.empresa_id}
      AND status IN ('VENDA', 'PAGO')
      AND date(data_criacao) = CURRENT_DATE
    `

    // 2. Busca Faturamento do Mês Atual (Status VENDA ou PAGO)
    const [faturamentoMes] = await sql`
      SELECT COALESCE(SUM(valor_total), 0) as total
      FROM pedidos
      WHERE empresa_id = ${user.empresa_id}
      AND status IN ('VENDA', 'PAGO')
      AND data_criacao >= date_trunc('month', CURRENT_DATE)
    `

    // 3. Conta Orçamentos Pendentes (Status Orçamento ou PROPOSTA)
    const [orcamentosAbertos] = await sql`
      SELECT COUNT(*) as qtd
      FROM pedidos
      WHERE empresa_id = ${user.empresa_id}
      AND status IN ('Orçamento', 'ORÇAMENTO', 'PROPOSTA')
    `

    // 4. Dados para o Gráfico (Últimos 7 dias)
    const desempenho = await sql`
        SELECT 
            to_char(data_criacao, 'DD/MM') as dia,
            COALESCE(SUM(valor_total), 0) as total
        FROM pedidos
        WHERE empresa_id = ${user.empresa_id}
        AND status IN ('VENDA', 'PAGO')
        AND data_criacao >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY 1
        ORDER BY MIN(data_criacao) ASC
    `

    return {
      vendas_hoje: vendasHoje.total,
      faturamento_mes: faturamentoMes.total,
      orcamentos_abertos: orcamentosAbertos.qtd,
      grafico: desempenho
    }

  } catch (e: any) {
    console.error("Erro no dashboard:", e)
    return { vendas_hoje: 0, faturamento_mes: 0, orcamentos_abertos: 0, grafico: [] }
  }
})