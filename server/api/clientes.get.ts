import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    const usuario = JSON.parse(cookie)

    try {
        // CORREÇÃO: Adicionamos telefone e cidade na busca
        const clientes = await sql`
            SELECT id, nome, email, telefone, cidade
            FROM clientes 
            WHERE empresa_id = ${usuario.empresa_id} 
               OR empresa_id IS NULL 
            ORDER BY nome ASC
        `
        
        // Retornamos direto (sem mudar 'nome' para 'name') para facilitar o frontend
        return clientes

    } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        return []
    }
})