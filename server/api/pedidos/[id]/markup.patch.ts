import { lerToken } from '~/server/utils/lerToken'
import { sql } from '~/server/utils/db' 
export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

  const usuario = lerToken(cookie)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const percentToSave = Number(body.markup_percent)
  const fatorMultiplicador = Number(body.fator_multiplicador ?? 1)

  if (!id || isNaN(percentToSave) || isNaN(fatorMultiplicador) || fatorMultiplicador < 1) {
    throw createError({ statusCode: 400, message: 'Dados inválidos' })
  }

  if (!usuario?.empresa_id) {
    throw createError({ statusCode: 401, message: 'Usuário sem empresa vinculada' })
  }

  try {
    const [pedido] = await sql`
      SELECT valor_total, total 
      FROM pedidos 
      WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
    `

    if (!pedido) {
      throw createError({ statusCode: 404, message: 'Pedido não encontrado' })
    }

    const originalTotal = Number(pedido.valor_total || pedido.total)
    if (isNaN(originalTotal)) {
      throw createError({ statusCode: 400, message: 'Total original inválido' })
    }

    const finalTotal = Number((originalTotal * fatorMultiplicador).toFixed(2))

    const [updated] = await sql`
      UPDATE pedidos
      SET 
        markup_percent = ${Number(percentToSave.toFixed(2))}, 
        final_total = ${finalTotal}
      WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
      RETURNING id, final_total, markup_percent
    `

    return { success: true, updated }

  } catch (error: any) {
  console.error('ERRO REAL DO PATCH MARKUP:', error)

  throw createError({
    statusCode: 500,
    message: error.message || 'Erro interno ao salvar no banco'
  })
}
})
