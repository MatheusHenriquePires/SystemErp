import { lerToken } from '~/server/utils/lerToken'
import sql from '~/server/database'
import { defineEventHandler, getCookie, getRouterParam, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // ✅ Validação do cookie
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) {
      throw createError({ statusCode: 401, message: 'Login necessário' })
    }

    // ✅ Decodifica token
    const usuario = lerToken(cookie)

    // ✅ Garante empresa
    if (!usuario?.empresa_id) {
      throw createError({ statusCode: 401, message: 'Usuário sem empresa vinculada' })
    }

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const percentToSave = Number(body.markup_percent)
    const fatorMultiplicador = Number(body.fator_multiplicador ?? 1)

    // ✅ Validação de dados
    if (!id || isNaN(percentToSave) || isNaN(fatorMultiplicador) || fatorMultiplicador < 1) {
      throw createError({ statusCode: 400, message: 'Dados inválidos' })
    }

    // ✅ Busca pedido
    const [pedido] = await sql`
      SELECT valor_total, total 
      FROM pedidos 
      WHERE id = ${id} AND empresa_id = ${usuario.empresa_id}
    `

    if (!pedido) {
      throw createError({ statusCode: 404, message: 'Pedido não encontrado' })
    }

    // ✅ Correção DEFINITIVA do cálculo
    const originalTotal =
      pedido.valor_total !== null && Number(pedido.valor_total) > 0
        ? Number(pedido.valor_total)
        : Number(pedido.total)

    if (!originalTotal || isNaN(originalTotal)) {
      console.error('DEBUG TOTAL INVALIDO:', pedido)
      throw createError({ statusCode: 400, message: 'Total original inválido no banco' })
    }

    // ✅ Cálculo final
    const finalTotal = Number((originalTotal * fatorMultiplicador).toFixed(2))

    // ✅ Update seguro
    const [updated] = await sql`
      UPDATE pedidos
      SET 
        markup_percent = ${Number(percentToSave.toFixed(2))}, 
        final_total = ${finalTotal}
      WHERE id = ${id} 
        AND empresa_id = ${usuario.empresa_id}
      RETURNING id, final_total, markup_percent
    `

    if (!updated) {
      throw createError({ statusCode: 500, message: 'Falha ao atualizar o pedido' })
    }

    return {
      success: true,
      updated
    }

  } catch (error: any) {
    console.error('ERRO REAL DO PATCH MARKUP:', error)

    // ✅ Agora retorna o status REAL do erro (não força mais 500)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro interno ao salvar no banco'
    })
  }
})
