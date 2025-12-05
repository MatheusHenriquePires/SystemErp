import { defineEventHandler, getCookie, createError, getRouterParam } from 'h3'
// 👇 Importa a conexão compartilhada (Evita travar o banco)
import sql from '../../database'

// Função auxiliar para ler o JWT (mantida igual)
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
    // 1. Segurança: Verifica se está logado
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    // 2. Pega o ID da URL
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID do produto obrigatório' })

    try {
        // 3. Deleta do banco
        // O RETURNING id é útil para confirmar se algo foi realmente apagado
        const [produtoDeletado] = await sql`
            DELETE FROM produtos 
            WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id
        `

        // Se não retornou ID, ou o produto não existe ou pertence a outra empresa
        if (!produtoDeletado) {
             throw createError({ statusCode: 404, message: 'Produto não encontrado ou você não tem permissão.' })
        }

        return { success: true }

    } catch (error: any) {
        console.error('Erro delete produto:', error)

        // Erro de chave estrangeira (Produto já vendido)
        if (error.code === '23503') { 
            throw createError({ 
                statusCode: 409, // 409 Conflict é o código HTTP correto para isso
                message: 'Não é possível excluir: Este produto já faz parte de vendas ou orçamentos.' 
            })
        }
        
        throw createError({ statusCode: 500, message: 'Erro interno ao excluir produto.' })
    }
})