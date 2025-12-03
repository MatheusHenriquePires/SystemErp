import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    let usuario;
    try {
        usuario = jwt.verify(cookie, EXPLICIT_SECRET) as { empresa_id: number };
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    const body = await readBody(event)
    if (!body.id || !body.status) throw createError({ statusCode: 400, message: 'Dados incompletos' })

    try {
        // 2. Verifica status atual
        const pedidoAtual = await sql`
            SELECT status FROM pedidos 
            WHERE id = ${body.id} AND empresa_id = ${usuario.empresa_id}
        `
        
        if (pedidoAtual.length === 0) throw createError({ statusCode: 404, message: 'Pedido não encontrado' })
        
        const statusAntigo = pedidoAtual[0].status;
        const novoStatus = body.status;

        // 3. LÓGICA DE ESTOQUE (BAIXA)
        // Só executa se estiver mudando de ORCAMENTO para VENDA
        if (statusAntigo === 'ORCAMENTO' && novoStatus === 'VENDA') {
            
            // Busca os itens desse pedido
            const itens = await sql`
                SELECT produto_id, quantidade 
                FROM pedidos_itens 
                WHERE pedido_id = ${body.id} AND produto_id IS NOT NULL
            `

            // Para cada item, subtrai a quantidade vendida da QUANTIDADE em estoque
            for (const item of itens) {
                await sql`
                    UPDATE produtos 
                    SET quantidade = quantidade - ${item.quantidade} -- MUDANÇA AQUI (Usando 'quantidade' como estoque)
                    WHERE id = ${item.produto_id}
                `
            }
        }

        // 4. LÓGICA DE ESTORNO (Devolve se cancelar)
        if (statusAntigo === 'VENDA' && novoStatus === 'CANCELADO') {
             const itens = await sql`SELECT produto_id, quantidade FROM pedidos_itens WHERE pedido_id = ${body.id} AND produto_id IS NOT NULL`
             for (const item of itens) {
                await sql`UPDATE produtos SET quantidade = quantidade + ${item.quantidade} WHERE id = ${item.produto_id}`
             }
        }

        // 5. Atualiza o status do pedido
        const resultado = await sql`
            UPDATE pedidos 
            SET status = ${novoStatus}
            WHERE id = ${body.id}
            RETURNING id, status
        `

        return { success: true, novo_status: resultado[0].status }

    } catch (error: any) {
        console.error("Erro Put:", error)
        throw createError({ statusCode: 500, message: error.message })
    }
})