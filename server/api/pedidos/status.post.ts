// server/api/pedidos/status.post.ts (Mudar Status)
import sql from '~/server/database'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id, novo_status } = body // Espera { id: 123, novo_status: 'VENDA' }

    if (!id || !novo_status) {
        throw createError({ statusCode: 400, message: 'ID e novo_status são obrigatórios.' })
    }

    try {
        // Apenas atualiza o status na tabela pedidos
        // O TRIGGER DO BANCO DE DADOS fará a baixa de estoque/lançamento no caixa
        const [result] = await sql`
            UPDATE pedidos 
            SET status = ${novo_status}
            WHERE id = ${id}
            RETURNING id, status
        `
        
        if (!result) {
             throw createError({ statusCode: 404, message: `Pedido com ID ${id} não encontrado.` });
        }

        return { success: true, message: `Status atualizado para ${result.status}` }
    } catch (error) {
        console.error("ERRO CRÍTICO NO UPDATE:", error)
        throw createError({ statusCode: 500, message: 'Falha ao atualizar status. Verifique as restrições do banco (Triggers/Chaves).' })
    }
})