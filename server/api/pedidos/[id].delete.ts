// server/api/pedidos/[id].delete.ts

// Apenas importamos as ferramentas do H3. 
// NÃO importe o 'sql'. O Nuxt injeta ele automaticamente em arquivos .ts
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;

  // Validação
  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID inválido. O ID deve ser numérico.',
    });
  }

  try {
    // O 'sql' será reconhecido automaticamente agora
    const [pedidoDeletado] = await sql`
      DELETE FROM pedidos
      WHERE id = ${id}
      RETURNING id
    `;

    if (!pedidoDeletado) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Pedido não encontrado para exclusão.',
      });
    }

    return {
      success: true,
      message: `Pedido ${id} removido com sucesso.`,
    };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Erro ao deletar pedido:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao tentar deletar o pedido.',
    });
  }
})