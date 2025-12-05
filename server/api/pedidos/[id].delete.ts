import { defineEventHandler, createError } from 'h3';

// 👇 CORREÇÃO FINAL:
// 1. Removemos as chaves { } pois é um export default.
// 2. Apontamos para '../../database' (sai de 'pedidos', sai de 'api', chega em 'server')
import sql from '../../database'; 

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
});