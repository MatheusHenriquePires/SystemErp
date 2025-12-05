import postgres from 'postgres'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    try {
        jwt.verify(cookie, EXPLICIT_SECRET);
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    try {
        // --- LOGICA INTELIGENTE DE VALORES ---
        // Usamos COALESCE(final_total, valor_total, 0)
        // Isso significa: "Tente pegar o final_total. Se for nulo, pegue o valor_total."

        const [vendasHoje, orcamentosPendentes, vendasMes, historico, lucroEstimado] = await Promise.all([
            
            // A. Vendas Hoje (Apenas PAGO)
            sql`
                SELECT COALESCE(SUM(COALESCE(final_total, valor_total, 0)), 0) as total 
                FROM pedidos 
                WHERE status = 'PAGO' 
                AND data_criacao::date = CURRENT_DATE
            `,

            // B. Orçamentos Pendentes (Mantivemos PROPOSTA e ORCAMENTO)
            sql`
                SELECT COUNT(*) as qtd 
                FROM pedidos 
                WHERE status IN ('ORCAMENTO', 'PROPOSTA')
            `,

            // C. Faturamento Mês Atual (Apenas PAGO)
            sql`
                SELECT COALESCE(SUM(COALESCE(final_total, valor_total, 0)), 0) as total 
                FROM pedidos 
                WHERE status = 'PAGO' 
                AND data_criacao >= date_trunc('month', CURRENT_DATE)
            `,

            // D. Gráfico (Apenas PAGO)
            sql`
                SELECT 
                    to_char(data_criacao, 'DD/MM') as dia,
                    COALESCE(SUM(COALESCE(final_total, valor_total, 0)), 0) as total
                FROM pedidos
                WHERE status = 'PAGO'
                AND data_criacao > CURRENT_DATE - INTERVAL '7 days'
                GROUP BY 1
                ORDER BY 1
            `,

            // E. Lucro Estimado (Receita - Custo)
            // Consideramos 'total' como custo. Se for 0, o lucro é total.
            sql`
                SELECT COALESCE(SUM(COALESCE(final_total, valor_total, 0) - COALESCE(total, 0)), 0) as total
                FROM pedidos
                WHERE status = 'PAGO'
                AND data_criacao >= date_trunc('month', CURRENT_DATE)
            `
        ])

        return {
            vendas_hoje: Number(vendasHoje[0].total),
            orcamentos_abertos: Number(orcamentosPendentes[0].qtd),
            faturamento_mes: Number(vendasMes[0].total),
            lucro_mes: Number(lucroEstimado[0].total),
            grafico: historico.map(h => ({
                dia: h.dia,
                total: Number(h.total)
            }))
        }

    } catch (error) {
        console.error("ERRO DASHBOARD:", error)
        throw createError({ statusCode: 500, message: 'Erro ao carregar dados' })
    }
})