// 1. Importa funções básicas do servidor
import { defineEventHandler, createError } from 'h3';

// 2. Importa o 'sql' explicitamente do sistema interno do Nuxt
// Isso resolve o erro "sql is not defined"
import { sql } from '#imports';

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
    // Agora o 'sql' vai funcionar
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