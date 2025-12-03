import postgres from 'postgres'
import { defineEventHandler, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

// Função auxiliar (mesma lógica)
function lerToken(token: string) {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString());
}

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    // 2. CORREÇÃO AQUI
    const usuario = lerToken(cookie)

    if (!usuario || !usuario.empresa_id) {
         throw createError({ statusCode: 401, message: 'Sessão inválida' })
    }

    // 3. Busca produtos
    const produtos = await sql`
        SELECT * FROM produtos
        WHERE empresa_id = ${usuario.empresa_id}
        ORDER BY nome ASC
    `
    return produtos
})