import sql from '~/server/database';
import { defineEventHandler, getCookie, createError } from 'h3';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao');
    if (!cookie) return [];

    try {
        const payload = jwt.decode(cookie) as { empresa_id: number };
        
        // Busca simples para o dropdown
        const clientes = await sql`
            SELECT id, nome 
            FROM clientes 
            WHERE empresa_id = ${payload.empresa_id} 
            ORDER BY nome ASC
        `;
        return clientes;
    } catch (e) {
        return [];
    }
});