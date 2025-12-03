// server/api/login.post.ts (FINAL - CORRIGIDO O ERRO 500)
import sql from '~/server/database' // Assumindo que este importa o cliente PostgreSQL
import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' 

// Variável de segredo usada nos dois endpoints
const EXPLICIT_SECRET = 'sua_chave_secreta_super_segura_12345'; 

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, senha } = body

    try {
        // 1. Buscar e autenticar no banco
        const usuarios = await sql`
            SELECT id, empresa_id, nome FROM usuarios 
            WHERE email = ${email} 
            AND senha = ${senha}
        `
        
        if (usuarios.length === 0) {
            throw createError({ statusCode: 401, message: 'Email ou senha inválidos' })
        }

        const usuario = usuarios[0]
        
        // 2. CRIAR O TOKEN JWT
        const payload = { 
            id: usuario.id, 
            empresa_id: usuario.empresa_id
        }
        
        // Assina o token com a chave explícita
        const token = jwt.sign(payload, EXPLICIT_SECRET, { 
            expiresIn: '2h' 
        })

        // 3. Define o cookie de sessão com o TOKEN JWT
        setCookie(event, 'usuario_sessao', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 2 // 2 horas
        })

        return { sucesso: true, usuario }

    } catch (erro) {
        if (erro.statusCode === 401) {
             throw erro;
        }
        // Este é o log que captura a falha SQL, se ocorrer após a conexão
        console.error('🔥 ERRO CRÍTICO NO LOGIN:', erro)
        // Retorna 500 se não for erro de autenticação 401
        throw createError({ statusCode: 500, message: 'Erro interno no servidor' })
    }
})