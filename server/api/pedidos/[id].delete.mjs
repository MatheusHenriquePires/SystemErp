// Importe sua conexão com o banco de dados. 
// Ajuste o caminho '../utils/db.js' para onde você configurou sua instância 'sql'
import { sql } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  // 1. Captura o ID da URL (ex: /api/pedidos/50)
  const id = event.context.params.id;

  // 2. Validação de Segurança: Garante que é um número
  // Isso previne o erro "invalid input syntax for type integer"
  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID inválido. O ID deve ser numérico.',
    });
  }

  try {
    // 3. Executa a deleção no banco
    // O 'RETURNING id' serve para sabermos se algo foi realmente apagado
    const [pedidoDeletado] = await sql`
      DELETE FROM pedidos
      WHERE id = ${id}
      RETURNING id
    `;

    // 4. Se não retornou nada, o ID não existia
    if (!pedidoDeletado) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Pedido não encontrado para exclusão.',
      });
    }

    // 5. Sucesso
    return {
      success: true,
      message: `Pedido ${id} removido com sucesso.`,
    };

  } catch (error) {
    // Se o erro já for um erro HTTP criado por nós (404 ou 400), apenas repassa
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