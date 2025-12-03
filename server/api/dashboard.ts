import postgres from 'postgres'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    try {
        jwt.verify(cookie, EXPLICIT_SECRET);
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    try {
        // 2. Executa todas as consultas em paralelo (Muito rápido)
        const [vendasHoje, orcamentosPendentes, vendasMes, historico] = await Promise.all([
            
            // A. Total Vendido Hoje (Status VENDA ou PAGO)
            sql`
                SELECT COALESCE(SUM(total), 0) as total 
                FROM pedidos 
                WHERE status IN ('VENDA', 'PAGO') 
                AND data_criacao::date = CURRENT_DATE
            `,

            // B. Quantidade de Orçamentos Pendentes
            sql`
                SELECT COUNT(*) as qtd 
                FROM pedidos 
                WHERE status = 'ORCAMENTO'
            `,

            // C. Total Vendido no Mês Atual
            sql`
                SELECT COALESCE(SUM(total), 0) as total 
                FROM pedidos 
                WHERE status IN ('VENDA', 'PAGO') 
                AND data_criacao >= date_trunc('month', CURRENT_DATE)
            `,

            // D. Dados para o Gráfico (Últimos 7 dias)
            sql`
                SELECT 
                    to_char(data_criacao, 'DD/MM') as dia,
                    COALESCE(SUM(total), 0) as total
                FROM pedidos
                WHERE status IN ('VENDA', 'PAGO')
                AND data_criacao > CURRENT_DATE - INTERVAL '7 days'
                GROUP BY 1
                ORDER BY 1
            `
        ])

        // 3. Retorna tudo formatado
        return {
            hoje: Number(vendasHoje[0].total),
            orcamentos: Number(orcamentosPendentes[0].qtd),
            mes: Number(vendasMes[0].total),
            grafico: historico.map(h => ({
                dia: h.dia,
                total: Number(h.total)
            }))
        }

    } catch (error) {
        console.error("Erro Dashboard:", error)
        throw createError({ statusCode: 500, message: 'Erro ao carregar dashboard' })
    }
})