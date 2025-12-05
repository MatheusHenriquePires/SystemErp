// 1. Importamos manualmente as funções do servidor para evitar o erro "is not defined"
import { defineEventHandler, createError } from 'h3';

// Nota: O 'sql' deve vir automaticamente de server/utils. 
// Se der erro de 'sql is not defined' no próximo teste, avise que ajustamos a importação dele.

export default defineEventHandler(async (event) => {
  const id = event.context.params.id;

  // Validação
  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID inválido. O ID deve ser numérico.',
    });
  }

  try {
    // Tenta deletar
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

  } catch (error) {
    // Se o erro for da nossa validação (400/404), repassa
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