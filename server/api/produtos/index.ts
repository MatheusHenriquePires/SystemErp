import { defineEventHandler, readBody, getCookie, createError, getQuery } from 'h3';
import sql from '../../database'; // Sua conexão compartilhada

// Função auxiliar para ler o token (mesma lógica do delete)
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
    // 1. Segurança: Verifica login e empresa
    const cookie = getCookie(event, 'usuario_sessao');
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' });

    const usuario = lerToken(cookie);
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' });
    }

    const method = event.node.req.method;

    // --- GET: Listar Produtos ---
    if (method === 'GET') {
        // Opcional: Filtros via URL (ex: ?busca=camera)
        const query = getQuery(event);
        const busca = query.busca ? `%${query.busca}%` : null;

        try {
            if (busca) {
                return await sql`
                    SELECT * FROM produtos 
                    WHERE empresa_id = ${usuario.empresa_id} 
                    AND nome ILIKE ${busca}
                    ORDER BY id DESC LIMIT 50
                `;
            } else {
                return await sql`
                    SELECT * FROM produtos 
                    WHERE empresa_id = ${usuario.empresa_id} 
                    ORDER BY id DESC LIMIT 50
                `;
            }
        } catch (error) {
            console.error('Erro ao listar:', error);
            return [];
        }
    }

    // --- POST: Criar Novo Produto ---
    if (method === 'POST') {
        const body = await readBody(event);

        // Validação básica
        if (!body.nome) throw createError({ statusCode: 400, message: 'Nome é obrigatório' });

        try {
            const [novoProduto] = await sql`
                INSERT INTO produtos (
                    empresa_id,
                    nome,
                    preco,
                    custo,
                    estoque_atual,
                    tipo,
                    categoria
                ) VALUES (
                    ${usuario.empresa_id}, -- Segurança: Pega ID do token, não do body
                    ${body.nome},
                    ${body.preco || 0},
                    ${body.custo || 0},
                    ${body.estoque_atual || 0},
                    'produto',
                    ${body.categoria || null}
                )
                RETURNING id, nome
            `;

            return novoProduto;

        } catch (error: any) {
            console.error('Erro ao criar:', error);
            // Erro de duplicidade (se você tiver constraint UNIQUE no nome)
            if (error.code === '23505') {
                throw createError({ statusCode: 409, message: 'Já existe um produto com este nome.' });
            }
            throw createError({ statusCode: 500, message: 'Erro ao salvar produto.' });
        }
    }
});