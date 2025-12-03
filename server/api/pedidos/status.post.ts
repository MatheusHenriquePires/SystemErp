// server/api/pedidos/status.post.ts
import sql from '~/server/database'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, novo_status } = body

  if (!id || !novo_status) {
    throw createError({ statusCode: 400, message: 'Dados inválidos' })
  }

  try {
    // Apenas atualiza o status. 
    // O Trigger do PostgreSQL fará a baixa de estoque ou lançamento no caixa automaticamente.
    await sql`
      UPDATE pedidos 
      SET status = ${novo_status}
      WHERE id = ${id}
    `
    return { success: true, message: `Status atualizado para ${novo_status}` }
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Erro ao atualizar status' })
  }
})