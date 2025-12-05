import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    // 1. Segurança: Verifica se o usuário está logado
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    // 2. Identifica a empresa do usuário
    const payload = jwt.decode(cookie) as { empresa_id: number }

    try {
        // Datas para filtrar o mês atual
        const hoje = new Date()
        const mesAtual = hoje.getMonth() + 1
        const anoAtual = hoje.getFullYear()

        // 3. Executa as 4 consultas em paralelo (Promise.all)
        const [recebidoMes, aReceber, baixoEstoque, recentes] = await Promise.all([
            
            // A: Dinheiro que entrou este mês (Financeiro PAGO)
            sql`
                SELECT COALESCE(SUM(valor), 0) as total 
                FROM financeiro 
                WHERE status = 'PAGO'
                AND EXTRACT(MONTH FROM data_pagamento) = ${mesAtual}
                AND EXTRACT(YEAR FROM data_pagamento) = ${anoAtual}
                -- AND empresa_id = ${payload.empresa_id} -- Descomente se tiver coluna empresa_id no financeiro
            `,

            // B: Dinheiro que falta entrar (Financeiro PENDENTE)
            sql`
                SELECT COALESCE(SUM(valor), 0) as total 
                FROM financeiro 
                WHERE status = 'PENDENTE'
                -- AND empresa_id = ${payload.empresa_id} -- Descomente se tiver coluna empresa_id no financeiro
            `,

            // C: Produtos acabando (Estoque < 5)
            sql`
                SELECT COUNT(*) as total 
                FROM produtos 
                WHERE empresa_id = ${payload.empresa_id} 
                AND estoque_atual < 5
            `,

            // D: 5 Últimos Pedidos (Para a tabelinha)
            sql`
                SELECT p.id, p.cliente_nome, p.valor_total, p.status
                FROM pedidos p
                WHERE p.empresa_id = ${payload.empresa_id}
                ORDER BY p.id DESC
                LIMIT 5
            `
        ])

        // 4. Retorna os dados formatados para o Frontend
        return {
            faturamento: recebidoMes[0].total, // Valor Real do Caixa
            pendentes: aReceber[0].total,      // Valor a Receber
            baixoEstoque: baixoEstoque[0].total,
            recentes: recentes
        }

    } catch (error) {
        console.error('Erro no dashboard:', error)
        // Retorna zerado se der erro, para não quebrar a tela
        return { faturamento: 0, pendentes: 0, baixoEstoque: 0, recentes: [] }
    }
})