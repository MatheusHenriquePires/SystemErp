import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
// Use a mesma chave que está no login.post.ts
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Verifica Login
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    try {
        jwt.verify(cookie, EXPLICIT_SECRET);
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    // 2. Recebe os dados
    const body = await readBody(event)
    
    // Validação
    if (!body.id || !body.status) {
        throw createError({ statusCode: 400, message: 'ID e Status são obrigatórios' })
    }

    // 3. Atualiza no Banco
    try {
        const resultado = await sql`
            UPDATE pedidos 
            SET status = ${body.status}
            WHERE id = ${body.id}
            RETURNING id, status
        `
        
        return { success: true, novo_status: resultado[0]?.status }

    } catch (error: any) {
        console.error(error)
        throw createError({ statusCode: 500, message: 'Erro ao atualizar status' })
    }
})