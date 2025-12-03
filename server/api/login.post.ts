// server/api/login.post.ts (CORRIGIDO PARA USAR JWT)
import postgres from 'postgres'
import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' // NOVO: Módulo JWT

// CRÍTICO: Se você não está usando bcryptjs, é vital que a senha seja encriptada no futuro.
// No momento, mantemos a sua busca por senha simples, mas preste atenção à segurança.
// import bcrypt from 'bcryptjs' 

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, senha } = body

    try {
        // 1. Buscar e autenticar no banco (mantendo sua autenticação simples)
        const usuarios = await sql`
            SELECT id, empresa_id, nome FROM usuarios 
            WHERE email = ${email} 
            AND senha = ${senha}
        `
        
        if (usuarios.length === 0) {
            throw createError({ statusCode: 401, message: 'Email ou senha inválidos' })
        }

        const usuario = usuarios[0]
        
        // 2. CRIAR O TOKEN JWT (O FORMATO CORRETO!)
        const payload = { 
            id: usuario.id, 
            empresa_id: usuario.empresa_id // CRÍTICO: O pedidos.post.ts PRECISA desta chave
        }
        
        // Assina o token JWT, com 2 horas de validade (maior segurança contra expiração)
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'SEGREDO_FORTE_AQUI', { 
            expiresIn: '2h' 
        })

        // 3. Define o cookie de sessão com o TOKEN JWT
        setCookie(event, 'usuario_sessao', token, {
            httpOnly: true, // Impedir acesso via JS (segurança)
            secure: process.env.NODE_ENV === 'production', // Só enviar em HTTPS
            sameSite: 'lax',
            path: '/', // CRÍTICO: Válido em toda a aplicação
            maxAge: 60 * 60 * 2 // 2 horas (em segundos)
        })

        return { sucesso: true, usuario }

    } catch (erro) {
        // Se for um erro 401 que já lançamos, propaga. Senão, é 500.
        if (erro.statusCode === 401) {
             throw erro;
        }
        console.error('🔥 ERRO CRÍTICO NO LOGIN:', erro)
        throw createError({ statusCode: 500, message: 'Erro interno no servidor' })
    }
})