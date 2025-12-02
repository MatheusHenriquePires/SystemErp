import sql from '~/server/database'
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. Autenticação
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    const usuario = JSON.parse(cookie)

    try {
        // 2. Busca Clientes da Empresa
        // Se a lista estiver vazia, pode ser que o usuário esteja em uma empresa nova sem clientes
        // ou que a coluna empresa_id esteja nula nos clientes antigos.
        
        // Esta query busca clientes da empresa OU clientes sem empresa (para compatibilidade com dados legados)
        const clientes = await sql`
            SELECT id, nome as name, email 
            FROM clientes 
            WHERE empresa_id = ${usuario.empresa_id} 
               OR empresa_id IS NULL -- Para pegar clientes antigos sem dono
            ORDER BY nome ASC
        `
        
        // Mapeia para garantir o formato correto (name vs nome)
        return clientes.map(c => ({
            id: c.id,
            name: c.name, // O frontend espera 'name'
            email: c.email
        }))

    } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        return []
    }
})