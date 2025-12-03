
import sql from '~/server/database'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'


export default defineEventHandler(async (event) => { // Use async aqui

  
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) { throw createError({ statusCode: 401, message: 'Não autorizado' }) }
    
 
    let payload;
    try {
        
        const usuario = JSON.parse(cookie)
        const empresaId = usuario.empresa_id 

        
        const body = await readBody(event)
        const { texto, autor } = body

    } catch (e) {
       
        console.error("ERRO DE AUTENTICAÇÃO/PARSING:", e);
        throw createError({ statusCode: 401, message: 'Falha na sessão.' });
    }

   
});