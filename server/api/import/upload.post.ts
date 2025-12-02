import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { createRequire } from 'module'

export default defineEventHandler(async (event) => {
    console.log("--- UPLOAD DE PDF (CORREÇÃO DE IMPORT) ---")

    // 1. Carregamento Blindado da Biblioteca
    let pdfParse
    try {
        const require = createRequire(import.meta.url)
        const lib = require('pdf-parse')
        
        // AQUI ESTÁ A CORREÇÃO DO ERRO:
        // Se 'lib' já for a função, usa ela. Se tiver .default, usa o .default.
        pdfParse = typeof lib === 'function' ? lib : lib.default
        
    } catch (libError) {
        console.error("Erro ao carregar pdf-parse:", libError)
        throw createError({ statusCode: 500, message: 'Biblioteca de PDF não instalada.' })
    }

    // 2. Ler arquivo
    const files = await readMultipartFormData(event)
    if (!files || files.length === 0) {
        throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
    }
    const pdfFile = files[0]

    try {
        // 3. Processar PDF
        const data = await pdfParse(pdfFile.data)
        const text = data.text

        // 4. Extrair Produtos
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
                        preco_custo: cost,
                        margem_lucro: 40,
                        preco: cost * 1.4,
                        tipo: 'produto'
                    })
                }
            }
        }

        return { success: true, items: items }

    } catch (error) {
        console.error("ERRO NO PARSE:", error)
        throw createError({ 
            statusCode: 500, 
            message: `Erro ao ler PDF: ${error.message}` 
        })
    }
})