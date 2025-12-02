import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { createRequire } from 'module'

// --- A SOLUÇÃO NUCLEAR ---
// Criamos um 'require' manual para carregar bibliotecas antigas (CommonJS) dentro do Nuxt (ESM)
const require = createRequire(import.meta.url)
const pdf = require('pdf-parse')
// -------------------------

export default defineEventHandler(async (event) => {
    console.log("--- INICIANDO UPLOAD DE PDF (MODO REQUIRE) ---")

    try {
        // 1. Ler o arquivo
        const files = await readMultipartFormData(event)
        
        if (!files || files.length === 0) {
            throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
        }

        const pdfFile = files[0]
        console.log(`Arquivo recebido: ${pdfFile.filename} (${pdfFile.data.length} bytes)`)

        // 2. Converter (Agora usando a importação segura)
        let data
        try {
            data = await pdf(pdfFile.data)
        } catch (libError) {
            console.error("Erro dentro da biblioteca pdf-parse:", libError)
            throw createError({ statusCode: 422, message: 'O PDF não pôde ser lido. Pode ser protegido por senha ou corrompido.' })
        }

        const text = data.text
        // console.log("Texto extraído:", text.substring(0, 100)) // Debug opcional

        // 3. Processar Linhas (Lógica Regex)
        const lines = text.split('\n')
        const items = []

        for (const line of lines) {
            const cleanLine = line.trim()
            if (cleanLine.length < 5) continue 

            // Busca preço no final (1.200,00 ou 50,00)
            const priceMatch = cleanLine.match(/R?\$?\s?(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)

            if (priceMatch) {
                // 1.200,00 -> 1200.00
                const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.')
                const cost = parseFloat(priceStr)

                let name = cleanLine.replace(priceMatch[0], '').trim()
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

        console.log(`Sucesso: ${items.length} itens extraídos.`)
        return { success: true, items: items }

    } catch (error) {
        console.error("ERRO FATAL NO UPLOAD:", error)
        throw createError({ 
            statusCode: 500, 
            message: `Erro técnico: ${error.message}` 
        })
    }
})