import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    try {
        jwt.verify(cookie, EXPLICIT_SECRET);
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    const body = await readBody(event)
    if (!body.id || !body.status) throw createError({ statusCode: 400, message: 'Dados incompletos' })

    try {
        // 1. Verifica status atual
        const pedidoAtual = await sql`SELECT status FROM pedidos WHERE id = ${body.id}`
        if (pedidoAtual.length === 0) throw createError({ statusCode: 404, message: 'Pedido não encontrado' })
        
        const statusAntigo = pedidoAtual[0].status;
        const novoStatus = body.status;

        console.log(`🔄 MUDANÇA DE STATUS: Pedido #${body.id} de ${statusAntigo} para ${novoStatus}`);

        // 2. LÓGICA DE BAIXA DE ESTOQUE
        if (statusAntigo === 'ORCAMENTO' && novoStatus === 'VENDA') {
            
            // Busca itens e LOGA o que encontrou
            const itens = await sql`
                SELECT produto_id, quantidade, descricao 
                FROM pedidos_itens 
                WHERE pedido_id = ${body.id}
            `
            console.log(`📦 Itens encontrados no pedido: ${itens.length}`);

            for (const item of itens) {
                // VERIFICAÇÃO CRUCIAL
                if (!item.produto_id) {
                    console.log(`⚠️ AVISO: O item "${item.descricao}" NÃO tem ID de produto vinculado. O estoque não será alterado.`);
                    continue; 
                }

                console.log(`🔻 Baixando ${item.quantidade} do Produto ID ${item.produto_id} na coluna 'estoque_atual'...`);

                // ATUALIZAÇÃO USANDO O NOME CORRETO DA COLUNA
                await sql`
                    UPDATE produtos 
                    SET estoque_atual = estoque_atual - ${item.quantidade}
                    WHERE id = ${item.produto_id}
                `
            }
        }

        // 3. Atualiza o status do pedido
        const resultado = await sql`
            UPDATE pedidos 
            SET status = ${novoStatus}
            WHERE id = ${body.id}
            RETURNING id, status
        `

        return { success: true, novo_status: resultado[0].status }

    } catch (error: any) {
        console.error("❌ Erro no PUT:", error)
        throw createError({ statusCode: 500, message: error.message })
    }
})