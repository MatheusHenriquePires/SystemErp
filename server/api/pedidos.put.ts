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

    // 1. Atualiza Cabeçalho do Pedido
    if (body.status || body.valor_total !== undefined) {
        const updateData: any = {}
        if (body.status) updateData.status = body.status
        if (body.valor_total !== undefined) updateData.valor_total = body.valor_total

        await sql`
            UPDATE pedidos set ${sql(updateData)}
            WHERE id = ${body.id} AND empresa_id = ${user.empresa_id}
        `
    }

    // 2. Atualiza ou Cria Itens
    if (body.itens && Array.isArray(body.itens)) {
        for (const item of body.itens) {
            
            if (item.id) {
                // --- UPDATE (Se já tem ID) ---
                await sql`
                    UPDATE pedidos_itens SET
                        descricao = ${item.descricao},
                        marca = ${item.marca || ''},
                        fornecedor = ${item.fornecedor || ''},
                        quantidade = ${item.quantidade},
                        preco_unitario = ${item.preco_unitario},
                        comodo = ${item.comodo || 'Geral'} 
                    WHERE id = ${item.id} AND pedido_id = ${body.id}
                `
            } else {
                // --- INSERT (Se ID é null = Item Novo!) ---
                // Isso faltava no seu código anterior.
                await sql`
                    INSERT INTO pedidos_itens (
                        pedido_id, 
                        descricao, 
                        marca, 
                        fornecedor, 
                        quantidade, 
                        preco_unitario, 
                        comodo
                    ) VALUES (
                        ${body.id},
                        ${item.descricao || 'Novo Item'},
                        ${item.marca || ''},
                        ${item.fornecedor || ''},
                        ${item.quantidade || 1},
                        ${item.preco_unitario || 0},
                        ${item.comodo || 'Geral'}
                    )
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