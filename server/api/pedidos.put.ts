import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    let usuario;
    try {
        usuario = jwt.verify(cookie, EXPLICIT_SECRET) as { empresa_id: number };
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    // 2. Recebe o ID e o novo Status
    const body = await readBody(event)
    
    if (!body.id || !body.status) {
        throw createError({ statusCode: 400, message: 'ID e Status são obrigatórios' })
    }

    // 3. Atualiza no Banco
    try {
        const resultado = await sql`
            UPDATE pedidos 
            SET status = ${body.status}
            WHERE id = ${body.id} AND empresa_id = ${usuario.empresa_id}
            RETURNING id, status
        `
        
        if (resultado.length === 0) {
            throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })
        }

        return { success: true, novo_status: resultado[0].status }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: error.message })
    }
})