import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  // 1. Segurança: Ler quem é o usuário logado via Cookie
  const token = getCookie(event, 'usuario_sessao')
  
  if (!token) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  // Decodifica o token para pegar o ID da empresa
  const user = jwt.verify(token, process.env.JWT_SECRET as string) as any

  // 2. Recebe os dados do Front
  const body = await readBody(event)

  if (!body.nome) {
    throw createError({ statusCode: 400, message: 'O nome é obrigatório' })
  }

  // 3. Insere no Banco
  try {
    const novoCliente = await sql`
      INSERT INTO clientes (nome, email, telefone, cidade, empresa_id)
      VALUES (${body.nome}, ${body.email}, ${body.telefone}, ${body.cidade}, ${user.empresa_id})
      RETURNING *
    `
    return { success: true, cliente: novoCliente[0] }

  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro ao salvar cliente' })
  }
})