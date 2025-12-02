import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import pdf from 'pdf-parse'

export default defineEventHandler(async (event) => {
    // 1. Ler o arquivo enviado (Multipart Form Data)
    const files = await readMultipartFormData(event)
    if (!files || files.length === 0) {
        throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado.' })
    }

    const pdfFile = files[0] // O arquivo PDF

    try {
        // 2. Extrair o Texto do PDF
        const data = await pdf(pdfFile.data)
        const text = data.text

        // 3. Processar o Texto (A Mágica acontece aqui)
        // AQUI você poderia mandar 'text' para o ChatGPT formatar.
        // Vamos usar uma lógica manual para tentar achar linhas com R$
        
        const lines = text.split('\n')
        const items = []

        // Lógica simples: Procura linhas que tenham nome e preço
        // Exemplo esperado: "Chapa MDF Branco ... 150,00"
        for (const line of lines) {
            // Remove espaços extras
            const cleanLine = line.trim()
            if (!cleanLine) continue

            // Tenta achar um preço no final da linha (ex: 150,00 ou 150.00)
            // Regex procura números no fim da string
            const priceMatch = cleanLine.match(/(\d+[.,]\d{2})$/)
            
            if (priceMatch) {
                const priceStr = priceMatch[0].replace(',', '.')
                const price = parseFloat(priceStr)
                
                // O nome é tudo que vem antes do preço (simplificado)
                const name = cleanLine.replace(priceMatch[0], '').trim()

                // Filtra linhas que são só lixo (cabeçalhos, datas, etc)
                if (name.length > 3 && price > 0) {
                    items.push({
                        name: name,
                        cost: price,
                        markup: 40, // Margem padrão de 40%
                        price: price * 1.4 // Preço final calculado
                    })
                }
            }
        }

        return { success: true, items: items }

    } catch (error) {
        console.error("Erro ao ler PDF:", error)
        throw createError({ statusCode: 500, message: 'Falha ao processar o arquivo PDF.' })
    }
})