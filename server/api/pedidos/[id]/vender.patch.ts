import { lerToken } from '~/server/utils/lerToken'
import sql from '~/server/database'
import { defineEventHandler, getCookie, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

  const usuario = lerToken(cookie)
  const id = getRouterParam(event, 'id')

  if (!usuario?.empresa_id) {
    throw createError({ statusCode: 401, message: 'Usuário sem empresa vinculada' })
  }

  const [pedido] = await sql`
    UPDATE pedidos
    SET status = 'VENDA'
    WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
    RETURNING *
  `

  return { success: true, pedido }
})
