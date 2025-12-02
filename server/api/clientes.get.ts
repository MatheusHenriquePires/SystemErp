import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    const usuario = JSON.parse(cookie)

    try {
        // Busca clientes apenas da empresa logada
        const clientes = await sql`
            SELECT id, name, email 
            FROM clientes 
            WHERE empresa_id = ${usuario.empresa_id}
            ORDER BY name ASC
        `
        return clientes
    } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        return []
    }
})