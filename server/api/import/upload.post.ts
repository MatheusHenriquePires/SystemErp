import { defineEventHandler, readMultipartFormData, createError } from 'h3'

export default defineEventHandler(async (event) => {
    console.log("--- TESTE DE UPLOAD INICIADO ---")

    try {
        // 1. Tenta ler o arquivo bruto
        const files = await readMultipartFormData(event)
        
        if (!files || files.length === 0) {
            throw createError({ statusCode: 400, message: 'Nenhum arquivo chegou.' })
        }

        const arquivo = files[0]
        console.log(`Sucesso! Arquivo recebido: ${arquivo.filename}`)
        console.log(`Tamanho: ${arquivo.data.length} bytes`)
        console.log(`Tipo: ${arquivo.type}`)

        // Retorna dados falsos só para testar o fluxo
        return { 
            success: true, 
            items: [
                { name: "TESTE DE UPLOAD OK", cost: 100, markup: 50, price: 150 },
                { name: "Arquivo lido com sucesso", cost: 0, markup: 0, price: 0 }
            ] 
        }

    } catch (error) {
        console.error("ERRO NO TESTE:", error)
        throw createError({ 
            statusCode: 500, 
            message: `Erro no servidor: ${error.message}` 
        })
    }
})