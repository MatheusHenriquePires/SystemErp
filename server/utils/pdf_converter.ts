import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import toBase64 from 'pdf-to-base64'; // Biblioteca simples Node.js

/**
 * Converte um PDF (Buffer) em uma imagem Base64.
 *
 * NOTA: Esta biblioteca de JS Puro geralmente requer salvar o arquivo temporariamente.
 * Ela é menos robusta que o 'canvas', mas evita erros de compilação C++.
 *
 * @param pdfBuffer O buffer binário do arquivo PDF.
 * @returns A string Base64 da imagem da primeira página (ou todo o PDF como imagem única).
 */
export async function convertPdfToBase64(pdfBuffer: Buffer): Promise<string> {
    const tempFilePath = path.join(os.tmpdir(), `temp_orcamento_${Date.now()}.pdf`);
    
    // 1. Salvar o buffer no disco temporariamente (necessário para esta biblioteca)
    try {
        fs.writeFileSync(tempFilePath, pdfBuffer);
    } catch (error) {
        throw new Error("Falha ao salvar o arquivo PDF temporário.");
    }

    try {
        // 2. Converter o arquivo salvo para Base64 da imagem
        // Esta biblioteca usa uma API ou um método interno que evita dependências externas
        // e retorna a imagem Base64 do PDF.
        const base64Image = await toBase64(tempFilePath);

        // 3. Remover o arquivo temporário
        fs.unlinkSync(tempFilePath);

        // O GPT-4V precisa do Base64 da imagem, não do PDF.
        // A função 'toBase64' aqui retorna a imagem (PNG/JPG) codificada em Base64.
        return base64Image;

    } catch (error) {
        // Garante que o arquivo temporário seja removido mesmo em caso de erro
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        
        console.error("Erro na conversão PDF para Base64 (pdf-to-base64):", error);
        throw new Error("Falha ao processar o PDF. Pode ser necessário usar uma API de terceiros.");
    }
}