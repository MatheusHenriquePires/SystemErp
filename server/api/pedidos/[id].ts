// server/api/pedidos/[id].ts (AGORA COM PRISMA)
import prisma from '~/server/utils/prisma' // Importa a instância do Prisma
import { defineEventHandler, getRouterParam, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

function lerToken(token: string) {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(base64, 'base64');
    return JSON.parse(buffer.toString('utf-8'));
}

export default defineEventHandler(async (event) => {
    // 1. SEGURANÇA (Mantida)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    const id = getRouterParam(event, 'id')
    const pedidoId = parseInt(id as string, 10);
    if (isNaN(pedidoId)) throw createError({ statusCode: 400, message: 'ID inválido.' });

    try {
        // 2. BUSCA DO PEDIDO E ITENS (UMA ÚNICA QUERY PRISMA)
        const pedidoComItens = await prisma.pedidos.findUnique({
            where: {
                id: pedidoId,
                empresa_id: usuario.empresa_id 
            },
            include: {
                // PRISMA GARANTE QUE O CAMPO comodo SERÁ MAPEADO CORRETAMENTE
                itens: {
                    select: {
                        id: true,
                        descricao: true,
                        quantidade: true,
                        preco_unitario: true,
                        total_preco: true,
                        comodo: true, // Prisma garante este mapeamento
                    }
                }
            }
        });

        if (!pedidoComItens) throw createError({ statusCode: 404, message: 'Pedido não encontrado.' })

        // 3. Formatação da Resposta (Adaptando o Prisma Output para o Frontend)
        const { itens, ...dadosPedido } = pedidoComItens;

        // Formata os itens para o formato esperado pelo Frontend
        const itensFormatados = itens.map(item => ({
            ...item,
            // Mantendo os nomes de colunas que o Frontend espera
            name: item.descricao,
            quantity: item.quantidade,
            unit_price: item.preco_unitario,
            // A coluna 'comodo' agora virá corretamente mapeada
        }));


        // 4. Retorna
        return {
            ...dadosPedido,
            itens: itensFormatados
        }

    } catch (e: any) {
        console.error("Erro ao buscar detalhes do pedido com Prisma:", e);
        // O Prisma geralmente lança erros com a propriedade message
        throw createError({ statusCode: 500, message: `Erro no banco de dados: ${e.message}` })
    } finally {
        // Nota: Em ambientes serverless ou Nuxt Nitro, a desconexão é opcional, 
        // mas é boa prática em conexões de curta duração.
        // await prisma.$disconnect(); 
    }
})