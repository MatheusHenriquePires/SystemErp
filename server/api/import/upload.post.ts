import { defineEventHandler, readMultipartFormData, createError } from 'h3'
// AQUI ESTÁ A CORREÇÃO: Importamos tudo com asterisco (*)
import * as pdfLib from 'pdf-parse'

export default defineEventHandler(async (event) => {
    console.log("--- INICIANDO UPLOAD DE PDF ---")

    try {
        // TRUQUE DE COMPATIBILIDADE:
        // Se o pdfLib tiver uma propriedade 'default', usamos ela.
        // Se não, usamos o próprio pdfLib. Isso resolve o erro do deploy.
        // @ts-ignore
        const pdf = pdfLib.default || pdfLib

        const files = await readMultipartFormData(event)
        
        if (!files || files.length === 0) {
            throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
        }

        const pdfFile = files[0]
        console.log(`Processando arquivo: ${pdfFile.filename}`)

        // Converte o PDF
        const data = await pdf(pdfFile.data)
        const text = data.text

        // Lógica de extração (Regex)
        const lines = text.split('\n')
        const items = []

        for (const line of lines) {
            const cleanLine = line.trim()
            if (cleanLine.length < 5) continue 

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
                        price: cost * 1.4
                    })
                }
            }
        }

        console.log(`Sucesso: ${items.length} itens extraídos.`)
        return { success: true, items: items }

    } catch (error) {
        console.error("ERRO NO UPLOAD:", error)
        throw createError({ 
            statusCode: 500, 
            message: 'Erro técnico ao ler PDF. Tente outro arquivo.' 
        })
    }
})