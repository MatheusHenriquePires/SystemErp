// Arquivo: server/api/pedidos/[id].delete.ts

// 1. Import do H3 (padrão do servidor)
import { defineEventHandler, createError } from 'h3';

// 2. Import do banco usando o alias da raiz (funciona em arquivos .ts)
// O Nuxt vai achar o arquivo seja ele db.js ou db.ts
import { sql } from '~/server/utils/db'; 

export default defineEventHandler(async (event) => {
  // O contexto pode vir como string, forçamos a tipagem ou validação
  const id = event.context.params?.id;

  // Validação: Garante que é número
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