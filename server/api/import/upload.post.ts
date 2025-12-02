import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import pdf from 'pdf-parse'

export default defineEventHandler(async (event) => {
    // 1. Ler o arquivo enviado pelo site
    const files = await readMultipartFormData(event)
    
    if (!files || files.length === 0) {
        throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
    }

    // O primeiro arquivo da lista (o PDF)
    const pdfFile = files[0]

    try {
        // 2. Converter o PDF em Texto Puro
        const data = await pdf(pdfFile.data)
        const text = data.text

        // 3. Processar linha por linha para achar produtos
        const lines = text.split('\n')
        const items = []

        for (const line of lines) {
            const cleanLine = line.trim()
            
            // Ignora linhas muito curtas (lixo)
            if (cleanLine.length < 5) continue 

            // A MÁGICA DO REGEX (Busca linhas que terminam com preço)
            // Procura padrões como: "1.200,00" ou "50,00" no final da linha
            const priceMatch = cleanLine.match(/R?\$?\s?(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/)

            if (priceMatch) {
                // Limpa o preço (tira o ponto de milhar e troca virgula por ponto)
                // Ex: "1.200,00" -> "1200.00"
                const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.')
                const cost = parseFloat(priceStr)

                // O nome é tudo que vem antes do preço
                let name = cleanLine.replace(priceMatch[0], '').trim()
                
                // Limpeza extra (remove "UN", "M2", "QTDE" se tiver no nome)
                name = name.replace(/\b(UN|PC|M2|KG|LTA)\b.*$/i, '').trim()

                // Se sobrou um nome válido e um preço maior que zero, é um produto!
                if (name.length > 2 && cost > 0) {
                    items.push({
                        name: name,
                        cost: cost, // Custo extraído do PDF
                        markup: 40, // Sugestão de margem padrão (40%)
                        price: cost * 1.4 // Preço de venda calculado
                    })
                }
            }
        }

        return { success: true, items: items }

    } catch (error) {
        console.error("Erro PDF:", error)
        throw createError({ statusCode: 500, message: 'Erro ao processar PDF. Verifique se não é uma imagem escaneada.' })
    }
})