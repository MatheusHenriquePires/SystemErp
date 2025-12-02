import { defineEventHandler, readMultipartFormData, createError } from 'h3'
// Truque de importação para evitar erro no Docker/Linux
import * as pdfLib from 'pdf-parse'

export default defineEventHandler(async (event) => {
    console.log("--- INICIANDO PROCESSAMENTO DE PDF ---")

    try {
        // 1. Ler o arquivo (Buffer)
        const files = await readMultipartFormData(event)
        if (!files || files.length === 0) {
            throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
        }

        const pdfFile = files[0]
        console.log(`Arquivo: ${pdfFile.filename} | Tamanho: ${pdfFile.data.length}`)

        // 2. Converter PDF para Texto
        // Resolve a compatibilidade da biblioteca
        const pdfParser = pdfLib.default || pdfLib
        
        // Processa o Buffer direto da memória
        const data = await pdfParser(pdfFile.data)
        const text = data.text
        
        // console.log("Texto extraído (início):", text.substring(0, 50))

        // 3. Extrair Produtos (Lógica Inteligente)
        const lines = text.split('\n')
        const items = []

        for (const line of lines) {
            const cleanLine = line.trim()
            if (cleanLine.length < 5) continue 

            // Regex: Procura preço no final da linha (ex: "Produto X ... 1.200,00")
            const priceMatch = cleanLine.match(/R?\$?\s?(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)

            if (priceMatch) {
                // Limpa o valor (1.200,00 -> 1200.00)
                const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.')
                const cost = parseFloat(priceStr)

                // O nome é tudo antes do preço
                let name = cleanLine.replace(priceMatch[0], '').trim()
                // Remove códigos comuns de nota fiscal (UN, M2, etc)
                name = name.replace(/\b(UN|PC|M2|KG|LTA)\b.*$/i, '').replace(/^\d+\s+/, '').trim()

                if (name.length > 2 && cost > 0) {
                    items.push({
                        name: name,
                        cost: cost,
                        markup: 40, // Margem padrão sugerida
                        price: cost * 1.4, // Preço final calculado
                        tipo: 'produto'
                    })
                }
            }
        }

        console.log(`Sucesso: ${items.length} itens encontrados.`)
        return { success: true, items: items }

    } catch (error) {
        console.error("ERRO NO PROCESSAMENTO:", error)
        throw createError({ 
            statusCode: 500, 
            message: `Erro ao ler PDF: ${error.message}` 
        })
    }
})