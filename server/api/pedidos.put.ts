import postgres from 'postgres'
import jwt from 'jsonwebtoken'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'usuario_sessao')
  if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

  const body = await readBody(event)

  if (!body.id) {
    throw createError({ statusCode: 400, message: 'ID do pedido é obrigatório' })
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any

    // 1. Atualiza Status e Valor Total (Cabeçalho)
    if (body.status || body.valor_total !== undefined) {
        // Monta um objeto dinâmico para update
        const updateData: any = {}
        if (body.status) updateData.status = body.status
        if (body.valor_total !== undefined) updateData.valor_total = body.valor_total

        await sql`
            UPDATE pedidos set ${sql(updateData)}
            WHERE id = ${body.id} AND empresa_id = ${user.empresa_id}
        `
    }

    // 2. Atualiza os Itens (Se vierem na requisição)
    if (body.itens && Array.isArray(body.itens)) {
        for (const item of body.itens) {
            // Só atualiza se tiver ID do item (edição)
            if (item.id) {
                await sql`
                    UPDATE pedidos_itens SET
                        descricao = ${item.descricao},
                        marca = ${item.marca || ''},
                        fornecedor = ${item.fornecedor || ''},
                        quantidade = ${item.quantidade},
                        preco_unitario = ${item.preco_unitario}
                    WHERE id = ${item.id} AND pedido_id = ${body.id}
                `
            }
        }
    }

    return { success: true, message: 'Pedido atualizado com sucesso' }

  } catch (error: any) {
    console.error('Erro PUT /api/pedidos:', error)
    throw createError({ statusCode: 500, message: 'Erro ao atualizar pedido' })
  }
})