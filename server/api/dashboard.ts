import postgres from 'postgres'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Segurança (Mantida)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    try {
        jwt.verify(cookie, EXPLICIT_SECRET);
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    try {
        // 2. Executa todas as consultas em paralelo
        const [vendasHoje, orcamentosPendentes, vendasMes, historico, lucroMes] = await Promise.all([
            
            // A. Vendas Hoje
            sql`SELECT COALESCE(SUM(total), 0) as total FROM pedidos 
                WHERE status IN ('VENDA', 'PAGO') AND data_criacao::date = CURRENT_DATE`,

            // B. Orçamentos
            sql`SELECT COUNT(*) as qtd FROM pedidos WHERE status = 'ORCAMENTO'`,

            // C. Faturamento Mês
            sql`SELECT COALESCE(SUM(total), 0) as total FROM pedidos 
                WHERE status IN ('VENDA', 'PAGO') AND data_criacao >= date_trunc('month', CURRENT_DATE)`,

            // D. Gráfico
            sql`SELECT to_char(data_criacao, 'DD/MM') as dia, COALESCE(SUM(total), 0) as total
                FROM pedidos
                WHERE status IN ('VENDA', 'PAGO') AND data_criacao > CURRENT_DATE - INTERVAL '7 days'
                GROUP BY 1 ORDER BY 1`,

            // E. NOVO: Lucro Líquido do Mês
            // (Preço Venda - Custo) * Quantidade
            sql`
                SELECT COALESCE(SUM((ip.preco_unitario - p.preco_custo) * ip.quantidade), 0) as total
                FROM pedidos ped
                JOIN pedido_itens ip ON ip.pedido_id = ped.id
                JOIN produtos p ON ip.produto_id = p.id
                WHERE ped.status IN ('VENDA', 'PAGO')
                AND ped.data_criacao >= date_trunc('month', CURRENT_DATE)
            `
        ])

        // 3. Retorno com os nomes CORRETOS que o Frontend espera
        return {
            vendas_hoje: Number(vendasHoje[0].total),
            orcamentos_abertos: Number(orcamentosPendentes[0].qtd),
            faturamento_mes: Number(vendasMes[0].total),
            lucro_mes: Number(lucroMes[0].total), // Novo campo
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