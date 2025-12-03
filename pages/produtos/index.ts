// server/api/produtos/index.ts
import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    // 1. AUTENTICAÇÃO
    const cookie = getCookie(event, 'usuario_sessao')
    // Nota: O middleware já deve bloquear não-logados, mas o backend precisa checar.
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' }) 
    
    try {
        // Leitura segura do payload
        const payload = jwt.decode(cookie) as { empresa_id: number }
        if (!payload || !payload.empresa_id) throw createError({ statusCode: 403, message: 'Sessão inválida.' })
        const empresaId = payload.empresa_id

        // 2. BUSCA NO BANCO
        const produtos = await sql`
            SELECT 
                id, 
                nome, 
                preco, 
                custo, 
                estoque_atual, 
                categoria, 
                medida 
            FROM produtos
            WHERE empresa_id = ${empresaId}
            ORDER BY nome ASC
        `
        return produtos
    } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        return []
    }
})