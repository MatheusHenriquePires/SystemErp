import { defineEventHandler, readBody, getCookie, createError, getQuery } from 'h3';
import sql from '../../database'; 

function lerToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(base64, 'base64');
        return JSON.parse(buffer.toString('utf-8'));
    } catch (e) { return null; }
}

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao');
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' });

    const usuario = lerToken(cookie);
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' });
    }

    const method = event.node.req.method;

    // --- GET: Listar ---
    if (method === 'GET') {
        const query = getQuery(event);
        const busca = query.busca ? `%${query.busca}%` : null;
        try {
            if (busca) {
                return await sql`
                    SELECT * FROM produtos 
                    WHERE empresa_id = ${usuario.empresa_id} AND nome ILIKE ${busca}
                    ORDER BY id DESC LIMIT 50
                `;
            }
            return await sql`SELECT * FROM produtos WHERE empresa_id = ${usuario.empresa_id} ORDER BY id DESC LIMIT 50`;
        } catch (error) { return []; }
    }

    // --- POST: Criar ---
    if (method === 'POST') {
        const body = await readBody(event);
        if (!body.nome) throw createError({ statusCode: 400, message: 'Nome obrigatório' });

        try {
            const [novo] = await sql`
                INSERT INTO produtos (empresa_id, nome, preco, custo, estoque_atual, categoria, tipo)
                VALUES (${usuario.empresa_id}, ${body.nome}, ${body.preco||0}, ${body.custo||0}, ${body.estoque_atual||0}, ${body.categoria||null}, 'produto')
                RETURNING *
            `;
            return novo;
        } catch (error: any) {
            if (error.code === '23505') throw createError({ statusCode: 409, message: 'Produto já existe.' });
            throw createError({ statusCode: 500, message: 'Erro ao criar.' });
        }
    }

    // --- PUT: Atualizar (O NOVO CÓDIGO ESTÁ AQUI) ---
    if (method === 'PUT') {
        const body = await readBody(event);
        
        if (!body.id) throw createError({ statusCode: 400, message: 'ID obrigatório para edição.' });

        try {
            const [atualizado] = await sql`
                UPDATE produtos SET
                    nome = ${body.nome},
                    preco = ${body.preco || 0},
                    custo = ${body.custo || 0},
                    estoque_atual = ${body.estoque_atual || 0},
                    categoria = ${body.categoria || null}
                WHERE id = ${body.id} AND empresa_id = ${usuario.empresa_id}
                RETURNING *
            `;

            if (!atualizado) throw createError({ statusCode: 404, message: 'Produto não encontrado.' });
            return atualizado;

        } catch (error: any) {
            console.error(error);
            throw createError({ statusCode: 500, message: 'Erro ao atualizar.' });
        }
    }
});