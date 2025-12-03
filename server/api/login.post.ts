import jwt from 'jsonwebtoken'
import postgres from 'postgres'
import { defineEventHandler, readBody, setCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

// Chave secreta para assinar o token
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42'; 

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Verifica usuário no banco
    const usuarios = await sql`
        SELECT * FROM usuarios WHERE email = ${body.email} AND senha = ${body.senha}
    `
    const usuario = usuarios[0]

    if (!usuario) {
        throw createError({ statusCode: 401, message: 'Email ou senha incorretos' })
    }

    // 2. Cria o Token
    const token = jwt.sign(
        { 
            id: usuario.id, 
            email: usuario.email, 
            empresa_id: usuario.empresa_id 
        }, 
        EXPLICIT_SECRET, 
        { expiresIn: '7d' }
    );

    // 3. Salva no Cookie
  setCookie(event, 'usuario_sessao', token, {
        httpOnly: true,     
        secure: false,      
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/'          
    })

    return { success: true, user: usuario }

    return { success: true, user: usuario }
})