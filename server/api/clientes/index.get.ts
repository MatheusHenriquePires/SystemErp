import sql from '~/server/database';
import { defineEventHandler, getCookie, createError, readBody } from 'h3';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao');
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' });
    
    const payload = jwt.decode(cookie) as { empresa_id: number };
    const method = event.node.req.method;

    // --- GET: Listar Todos (Com dados completos para a tabela) ---
    if (method === 'GET') {
        try {
            const clientes = await sql`
                SELECT * FROM clientes 
                WHERE empresa_id = ${payload.empresa_id} 
                ORDER BY id DESC
            `;
            return clientes;
        } catch (e) {
            return [];
        }
    }

    // --- POST: Criar Novo Cliente ---
    if (method === 'POST') {
        const body = await readBody(event);
        
        if (!body.nome) throw createError({ statusCode: 400, message: 'Nome obrigatório' });

        try {
            await sql`
                INSERT INTO clientes (empresa_id, nome, email, telefone, cidade)
                VALUES (${payload.empresa_id}, ${body.nome}, ${body.email}, ${body.telefone}, ${body.cidade})
            `;
            return { success: true };
        } catch (error: any) {
            console.error(error);
            throw createError({ statusCode: 500, message: 'Erro ao cadastrar.' });
        }
    }
});