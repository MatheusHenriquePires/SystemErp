import sql from '~/server/database';
import { defineEventHandler, getCookie, createError, readBody } from 'h3';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao');
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' });
    
    const payload = jwt.decode(cookie) as { empresa_id: number };
    const id = event.context.params?.id;
    const method = event.node.req.method;

    if (!id) throw createError({ statusCode: 400, message: 'ID obrigatório' });

    // --- GET: Busca Cliente + Histórico de Pedidos ---
    if (method === 'GET') {
        try {
            // 1. Dados do Cliente
            const [cliente] = await sql`
                SELECT * FROM clientes 
                WHERE id = ${id} AND empresa_id = ${payload.empresa_id}
            `;

            if (!cliente) throw createError({ statusCode: 404, message: 'Cliente não encontrado' });

            // 2. Histórico de Pedidos (Vendas/Orçamentos)
            const historico = await sql`
                SELECT id, data_criacao, valor_total, status, vendedor_id 
                FROM pedidos 
                WHERE cliente_id = ${id} AND empresa_id = ${payload.empresa_id}
                ORDER BY id DESC
            `;

            return { cliente, historico };

        } catch (error) {
            throw createError({ statusCode: 500, message: 'Erro ao carregar ficha do cliente' });
        }
    }

    // --- PUT: Editar Cliente ---
    if (method === 'PUT') {
        const body = await readBody(event);
        
        try {
            await sql`
                UPDATE clientes SET
                    nome = ${body.nome},
                    email = ${body.email},
                    telefone = ${body.telefone},
                    cidade = ${body.cidade},
                    endereco = ${body.endereco || null}
                WHERE id = ${id} AND empresa_id = ${payload.empresa_id}
            `;
            return { success: true, message: 'Cliente atualizado!' };
        } catch (error) {
            throw createError({ statusCode: 500, message: 'Erro ao atualizar dados.' });
        }
    }

    // --- DELETE: Excluir Cliente ---
    if (method === 'DELETE') {
        try {
            await sql`DELETE FROM clientes WHERE id = ${id} AND empresa_id = ${payload.empresa_id}`;
            return { success: true };
        } catch (error: any) {
            // Código 23503 = Violação de chave estrangeira (Cliente tem pedidos)
            if (error.code === '23503') {
                throw createError({ statusCode: 409, message: 'Não é possível excluir: Este cliente possui histórico de vendas.' });
            }
            throw createError({ statusCode: 500, message: 'Erro ao excluir.' });
        }
    }
});