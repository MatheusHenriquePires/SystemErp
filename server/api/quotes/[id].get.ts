import sql from '~/server/database'
import { defineEventHandler, getCookie, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    
    const usuario = JSON.parse(cookie)
    const id = getRouterParam(event, 'id')

    try {
        // PASSO 1: BUSCAR O NOME DA EMPRESA DO USUÁRIO (A fonte da verdade)
        // Isso garante que o nome no topo do PDF seja sempre o da empresa que está usando o sistema
        const [empresa] = await sql`
            SELECT nome 
            FROM empresas 
            WHERE id = ${usuario.empresa_id}
        `
        
        // Se por algum milagre o banco não tiver o nome, usa um fallback, mas vai usar o do banco.
        const nomeEmpresaCabecalho = empresa?.nome || 'Nome da Empresa Não Encontrado';

        // PASSO 2: BUSCAR O ORÇAMENTO + CLIENTE
        const [quote] = await sql`
            SELECT 
                q.id, 
                q.quote_date, 
                q.total_amount, 
                q.payment_terms, 
                q.status,
                COALESCE(c.name, 'Cliente não identificado') as cliente_nome, 
                COALESCE(c.email, '') as cliente_email, 
                COALESCE(c.telefone, '') as cliente_telefone,
                COALESCE(c.cidade, '') as cliente_cidade
            FROM quotes q
            LEFT JOIN clientes c ON q.customer_id = c.id
            WHERE q.id = ${id}
            -- Removemos travas extras aqui para garantir que o orçamento abra
        `

        if (!quote) {
            throw createError({ statusCode: 404, message: 'Orçamento não encontrado.' })
        }

        // PASSO 3: BUSCAR ITENS
        const items = await sql`
            SELECT name, quantity, unit_price, total_price
            FROM quote_items
            WHERE quote_id = ${id}
        `

        // PASSO 4: MONTAR O PACOTE FINAL
        return { 
            ...quote,
            
            // Aqui está a mágica: O nome vem do banco de dados da empresa logada
            empresa_nome: nomeEmpresaCabecalho, 
            
            total_amount: Number(quote.total_amount),
            items: items.map(i => ({
                name: i.name,
                quantity: Number(i.quantity),
                unit_price: Number(i.unit_price),
                total_price: Number(i.total_price)
            }))
        }

    } catch (e) {
        console.error(`Erro ao gerar PDF do orçamento ${id}:`, e)
        throw createError({ statusCode: 500, message: 'Erro interno ao gerar documento.' })
    }
})