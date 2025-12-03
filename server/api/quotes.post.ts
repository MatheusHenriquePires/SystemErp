// Mantenha toda a lógica de autenticação e cálculo do total.
// Altere APENAS o SQL de inserção (Exemplo abaixo, assumindo que você já migrou para a tabela 'pedidos'):

const [pedido] = await sql`
    INSERT INTO pedidos (
        cliente_id, 
        empresa_id, -- Adicionar empresa_id (que agora existe na tabela)
        cliente_nome,
        valor_total, 
        status, 
        data_criacao
    )
    VALUES (
        ${customerId}, 
        ${empresaId}, -- Puxa do JWT
        ${clienteNome}, -- Precisa buscar o nome do cliente antes, ou passar no payload
        ${totalAmount}, 
        'ORCAMENTO', -- Todo novo pedido começa como ORCAMENTO
        NOW()
    )
    RETURNING id
`
// E também ajustar o INSERT na tabela de itens para 'itens_pedido'