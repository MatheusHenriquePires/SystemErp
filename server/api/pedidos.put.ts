import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  // 1. Verificação de Segurança
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  // 2. Recebe os dados
  const body = await readBody(event)

  // Validação simplificada para atualização (só precisa do ID)
  if (!body.id) {
    throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório para atualização' })
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any

    // 3. Atualização Dinâmica
    // Se veio "status" no corpo, atualiza o status
    if (body.status) {
        await sql`
            UPDATE pedidos 
            SET status = ${body.status}
            WHERE id = ${body.id} AND empresa_id = ${user.empresa_id}
        `
    }
    
    // Se veio "valor_total" (da tela de margem), atualiza o valor
    if (body.valor_total !== undefined) {
        await sql`
            UPDATE pedidos 
            SET valor_total = ${body.valor_total}
            WHERE id = ${body.id} AND empresa_id = ${user.empresa_id}
        `
    }

    return { success: true, message: 'Pedido atualizado com sucesso' }

  } catch (error) {
    console.error('Erro no PUT /api/pedidos:', error)
    throw createError({ statusCode: 500, message: 'Erro ao atualizar pedido' })
  }
})