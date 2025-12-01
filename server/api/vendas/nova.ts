// server/api/vendas/nova.ts
import { sql } from '~/server/database'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {

  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const payload = jwt.decode(cookie) as { empresa_id: number }
  const empresa_id = payload.empresa_id

  const body = await readBody(event)
  const { cliente_id, itens } = body

  if (!cliente_id || !itens || itens.length === 0) {
    throw createError({ statusCode: 400, message: 'Dados inválidos.' })
  }

  const db = sql
  let venda_id: number

  try {
    // 1. CALCULAR O VALOR TOTAL
    let valor_total = 0
    for (const item of itens) {
      valor_total += item.preco_unitario * item.quantidade
    }

    // 2. INSERIR A VENDA PRINCIPAL (MESTRE)
    const resultVenda = await db.query(
      `
      INSERT INTO vendas (empresa_id, cliente_id, valor_total, status)
      VALUES ($1, $2, $3, 'concluido')
      RETURNING id
      `,
      [empresa_id, cliente_id, valor_total]
    )
    venda_id = resultVenda.rows[0].id

    // 3. INSERIR OS ITENS (DETALHES)
    for (const item of itens) {
      await db.query(
        `
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, empresa_id)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [venda_id, item.produto_id, item.quantidade, item.preco_unitario, empresa_id]
      )
      
      // 4. ATUALIZAR ESTOQUE (Diminuir)
      await db.query(
        `
        UPDATE produtos SET estoque_atual = estoque_atual - $1 WHERE id = $2 AND empresa_id = $3
        `,
        [item.quantidade, item.produto_id, empresa_id]
      )
    }

    // 5. REGISTRAR O RECEBIMENTO NO FINANCEIRO (DESPESAS, mas com tipo 'receita')
    await db.query(
      `
      INSERT INTO despesas (descricao, valor, categoria, tipo, empresa_id, cliente_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      ['Recebimento Venda #' + venda_id, valor_total, 'Vendas', 'receita', empresa_id, cliente_id]
    )

    return {
      message: 'Venda registrada com sucesso.',
      venda_id: venda_id,
      valor_total: valor_total,
    }

  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    throw createError({ statusCode: 500, message: 'Erro interno ao salvar a venda.' })
  }
})