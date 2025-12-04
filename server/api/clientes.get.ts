import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

// Função auxiliar para decodificar o JWT (Payload)
function lerToken(token: string) {
    try {
        const base64Url = token.split('.')[1]; // Pega a parte do meio
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(base64, 'base64');
        return JSON.parse(buffer.toString('utf-8'));
    } catch (e) {
        return null;
    }
}

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    
    // 1. Validação básica
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })

    // 2. CORREÇÃO AQUI: Usamos a função lerToken ao invés de JSON.parse direto
    const usuario = lerToken(cookie)

    // Se o token estiver corrompido ou inválido
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 401, message: 'Sessão inválida' })
    }

    try {
        const clientes = await sql`
            SELECT id, nome, email, telefone, cidade
            FROM clientes 
            WHERE empresa_id = ${usuario.empresa_id} 
               OR empresa_id IS NULL 
            ORDER BY nome ASC
            
        `
        return clientes

    } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        return []
    }
})