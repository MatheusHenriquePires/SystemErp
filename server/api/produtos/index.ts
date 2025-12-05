import { defineEventHandler, readBody, createError } from 'h3';
// Importação da conexão (usando o caminho que funcionou antes)
import sql from '../../database'; 

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // --- GET: Listar Produtos ---
  if (method === 'GET') {
    try {
      // Trazemos tudo ordenado pelo ID
      const produtos = await sql`
        SELECT * FROM produtos 
        ORDER BY id DESC
      `;
      return produtos;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return [];
    }
  }

  // --- POST: Criar Novo Produto ---
  if (method === 'POST') {
    try {
      const body = await readBody(event);
      
      if (!body.nome) {
        throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório' });
      }

      // IMPORTANTE: Aqui usamos suas colunas reais:
      // preco (venda), custo (custo), estoque_atual
      // empresa_id: fixei como 1 temporariamente ou NULL se seu sistema for multi-empresa
      
      const [novoProduto] = await sql`
        INSERT INTO produtos (
          nome, 
          preco, 
          custo, 
          estoque_atual, 
          tipo,
          empresa_id
        ) VALUES (
          ${body.nome}, 
          ${body.preco || 0}, 
          ${body.custo || 0}, 
          ${body.estoque_atual || 0}, 
          'produto',
          1
        )
        RETURNING *
      `;

      return novoProduto;

    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      // Tratamento para o erro de nome duplicado (Unique Constraint)
      if (error.code === '23505') { 
        throw createError({ statusCode: 409, statusMessage: 'Já existe um produto com este nome.' });
      }
      throw createError({ statusCode: 500, statusMessage: 'Erro ao salvar produto' });
    }
  }
});