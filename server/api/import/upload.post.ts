import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import pdf from 'pdf-parse'

export default defineEventHandler(async (event) => {
    console.log("--- INICIANDO UPLOAD DE PDF ---")

    try {
        // 1. Tenta ler o formulário
        const files = await readMultipartFormData(event)
        
        if (!files || files.length === 0) {
            console.error("Erro: Nenhum arquivo chegou no backend.")
            throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
        }

        const pdfFile = files[0]
        console.log(`Arquivo recebido: ${pdfFile.filename || 'sem-nome.pdf'} (${pdfFile.data.length} bytes)`)

        // 2. Tenta converter o PDF
        // O parse retorna uma Promise, aguardamos ela
        let data
        try {
            data = await pdf(pdfFile.data)
        } catch (parseError) {
            console.error("Erro CRÍTICO do pdf-parse:", parseError)
            throw createError({ statusCode: 422, message: 'O arquivo não é um PDF válido ou está corrompido.' })
        }

        const text = data.text
        console.log("Texto extraído (primeiros 50 chars):", text.substring(0, 50))

        // 3. Processar linhas
        const lines = text.split('\n')
        const items = []

        for (const line of lines) {
            const cleanLine = line.trim()
            if (cleanLine.length < 5) continue 

            // Regex: Procura dinheiro no fim (ex: 1.200,00 ou 50,00)
            const priceMatch = cleanLine.match(/R?\$?\s?(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)

            if (priceMatch) {
                // Limpa preço: 1.200,00 -> 1200.00
                const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.')
                const cost = parseFloat(priceStr)

                // Nome é o que vem antes
                let name = cleanLine.replace(priceMatch[0], '').trim()
                // Limpa sujeira comum de PDF (códigos, unidades)
                name = name.replace(/\b(UN|PC|M2|KG|LTA)\b.*$/i, '').replace(/^\d+\s+/, '').trim()

                if (name.length > 2 && cost > 0) {
                    items.push({
                        name: name,
                        cost: cost,
                        markup: 40,
                        price: cost * 1.4
                    })
                }
            }
        }

        console.log(`Sucesso: ${items.length} itens encontrados.`)
        return { success: true, items: items }

    } catch (error) {
        console.error("ERRO GERAL NO UPLOAD:", error)
        // Retorna o erro exato para o navegador ver
        throw createError({ 
            statusCode: error.statusCode || 500, 
            message: error.message || 'Erro interno ao processar PDF.' 
        })
    }
})