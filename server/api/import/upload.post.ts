import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { createRequire } from 'module'

export default defineEventHandler(async (event) => {
    console.log("--- UPLOAD PDF: INÍCIO ---")

    // =============== 1. CARREGAR PDF-PARSE COM FALLBACK TOTAL ===============
    let pdfParse

    try {
        const require = createRequire(import.meta.url)
        const lib = require('pdf-parse')

        console.log("DEBUG: Tipo carregado:", typeof lib)

        if (typeof lib === 'function') {
            pdfParse = lib
        }
        else if (lib && typeof lib.default === 'function') {
            pdfParse = lib.default
        }
        else if (lib?.pdf && typeof lib.pdf === 'function') {
            // Alguns dockers expõem como { pdf: fn }
            pdfParse = lib.pdf
        }
        else {
            throw new Error("Formato desconhecido da biblioteca pdf-parse.")
        }

        console.log("PDF-Parse carregado com sucesso:", typeof pdfParse)

    } catch (e) {
        console.error("ERRO AO IMPORTAR PDF-PARSE:", e)
        throw createError({ statusCode: 500, message: 'Falha ao carregar dependência pdf-parse.' })
    }

    // ===================== 2. RECEBER ARQUIVO ================================
    const files = await readMultipartFormData(event)
    if (!files || !files.length) {
        throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
    }

    const pdfFile = files[0]

    // ===================== 3. PROCESSAR O PDF ================================
    try {
        const parsed = await pdfParse(pdfFile.data)

        if (!parsed || !parsed.text) {
            throw new Error("PDF inválido ou sem texto.")
        }

        const text = parsed.text
        const lines = text.split('\n')
        const items = []

        for (const line of lines) {
            const cleanLine = line.trim()
            if (cleanLine.length < 5) continue

            // Regex de preço no final da linha
            const priceMatch = cleanLine.match(/R?\$?\s?(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)

            if (priceMatch) {
                const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.')
                const cost = parseFloat(priceStr)

                let name = cleanLine.replace(priceMatch[0], '').trim()
                name = name.replace(/\b(UN|PC|M2|KG|LTA)\b.*$/i, '').replace(/^\d+\s+/, '').trim()

                if (name.length > 2 && cost > 0) {
                    items.push({
                        name,
                        preco_custo: cost,
                        margem_lucro: 40,
                        preco: cost * 1.4,
                        tipo: 'produto'
                    })
                }
            }
        }

        return { success: true, items }

    } catch (e) {
        console.error("ERRO DURANTE LEITURA DO PDF:", e)
        throw createError({
            statusCode: 500,
            message: `Erro ao ler PDF: ${e.message}`
        })
    }
})
