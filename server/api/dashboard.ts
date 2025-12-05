import postgres from 'postgres'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

// Conexão com o Banco
const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Verificação de Login
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    try {
        jwt.verify(cookie, EXPLICIT_SECRET);
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    try {
        // 2. Buscando dados APENAS da tabela 'pedidos' que você confirmou que existe
        const [vendasHoje, orcamentosPendentes, vendasMes, historico, lucroEstimado] = await Promise.all([
            
            // A. Vendas Hoje (Usa final_total)
            sql`
                SELECT COALESCE(SUM(final_total), 0) as total 
                FROM pedidos 
                WHERE status IN ('VENDA', 'PAGO', 'APROVADO') 
                AND data_criacao::date = CURRENT_DATE
            `,

            // B. Orçamentos Pendentes
            sql`
                SELECT COUNT(*) as qtd 
                FROM pedidos 
                WHERE status = 'ORCAMENTO'
            `,

            // C. Faturamento Mês Atual
            sql`
                SELECT COALESCE(SUM(final_total), 0) as total 
                FROM pedidos 
                WHERE status IN ('VENDA', 'PAGO', 'APROVADO') 
                AND data_criacao >= date_trunc('month', CURRENT_DATE)
            `,

            // D. Gráfico (Últimos 7 dias)
            sql`
                SELECT 
                    to_char(data_criacao, 'DD/MM') as dia,
                    COALESCE(SUM(final_total), 0) as total
                FROM pedidos
                WHERE status IN ('VENDA', 'PAGO', 'APROVADO')
                AND data_criacao > CURRENT_DATE - INTERVAL '7 days'
                GROUP BY 1
                ORDER BY 1
            `,

            // E. Lucro (Cálculo Simplificado baseado na sua tabela atual)
            // Se 'total' for custo e 'final_total' for venda, isso funciona.
            // Se não, precisamos das tabelas de itens e produtos.
            sql`
                SELECT COALESCE(SUM(final_total - total), 0) as total
                FROM pedidos
                WHERE status IN ('VENDA', 'PAGO', 'APROVADO')
                AND data_criacao >= date_trunc('month', CURRENT_DATE)
            `
        ])

        // 3. Retorno Formatado
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
        console.error("ERRO NO SQL:", error) // Isso vai mostrar o erro real no terminal se falhar
        throw createError({ statusCode: 500, message: 'Erro ao carregar dashboard' })
    }
})