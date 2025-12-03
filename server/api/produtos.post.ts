import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

function lerToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(base64, 'base64');
        return JSON.parse(buffer.toString('utf-8'));
    } catch (e) {
        return null;
    }
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const cookie = getCookie(event, 'usuario_sessao')
    
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    if (!body.nome || !body.preco) {
        throw createError({ statusCode: 400, message: 'Nome e Preço são obrigatórios.' })
    }

    try {
        // CORREÇÃO: Usamos ON CONFLICT para atualizar se o nome já existir
        const novoProduto = await sql`
            INSERT INTO produtos (
                empresa_id,
                nome,
                preco,
                estoque_atual,
                tipo
            ) VALUES (
                ${usuario.empresa_id},
                ${body.nome},
                ${body.preco},
                ${body.estoque || 0},
                ${body.tipo || 'produto'}
            )
            ON CONFLICT ON CONSTRAINT unique_produto_nome
            DO UPDATE SET
                preco = EXCLUDED.preco,
                estoque_atual = EXCLUDED.estoque_atual
            RETURNING id
        `

        return { success: true, id: novoProduto[0].id }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: `Erro DB: ${error.message}` })
    }
})