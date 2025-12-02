import { defineEventHandler, readMultipartFormData, createError } from 'h3'

export default defineEventHandler(async (event) => {
    console.log("--- INICIANDO UPLOAD DIAGNÓSTICO ---")

    try {
        // 1. TENTATIVA DE CARREGAR A BIBLIOTECA
        const pdfParser = await import('pdf-parse')
        console.log("Biblioteca pdf-parse carregada com sucesso.")

        // 2. RECEBER ARQUIVO
        const files = await readMultipartFormData(event)
        if (!files || files.length === 0) {
            throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
        }

        const pdfFile = files[0]
        console.log(`Arquivo recebido: ${pdfFile.filename} (${pdfFile.data.length} bytes)`)

        // 3. TENTATIVA DE PARSE
        const data = await pdfParser.default(pdfFile.data)
        const text = data.text

        // 4. PROCESSAMENTO (Lógica de Negócio)
        const lines = text.split('\n')
        const items = []

        for (const line of lines) {
            const cleanLine = line.trim()
            if (cleanLine.length < 5) continue 

            // Regex para dinheiro (1.200,00 ou 50,00)
            const priceMatch = cleanLine.match(/R?\$?\s?(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)

            if (priceMatch) {
                const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.')
                const cost = parseFloat(priceStr)
                
                let name = cleanLine.replace(priceMatch[0], '').trim()
                name = name.replace(/\b(UN|PC|M2|KG|LTA)\b.*$/i, '').replace(/^\d+\s+/, '').trim()

                if (name.length > 2 && cost > 0) {
                    items.push({
                        name: name,
                        cost: cost,
                        markup: 40,
                        price: cost * 1.4,
                        tipo: 'produto'
                    })
                }
            }
        }

        return { success: true, items: items }

    } catch (error: unknown) {
        console.error("ERRO NO PARSE:", error)
        let message = 'Erro desconhecido'
        if (error instanceof Error) {
            message = error.message
        }
        throw createError({ 
            statusCode: 500, 
            message: `Erro ao ler o conteúdo do PDF: ${message}` 
        })
    }
})
