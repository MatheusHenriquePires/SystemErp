import * as pdfjsLib from 'pdfjs-dist';
// Importa o Canvas de forma especial para funcionar no Node.js
import { createCanvas } from 'canvas';

// Configura o worker para o pdfjs-dist
// OBS: Você pode precisar ajustar o caminho para o arquivo worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';

export async function convertPdfToBase64(pdfBuffer: Buffer): Promise<string> {
    const data = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    
    try {
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Pega a primeira página
        
        const viewport = page.getViewport({ scale: 2.0 }); // Escala para maior resolução
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        // Renderiza a página no canvas
        await page.render({
            canvasContext: context,
            viewport: viewport,
        }).promise;

        // Converte o canvas para Base64 (formato PNG)
        const base64Image = canvas.toDataURL('image/png').split(';base64,').pop();

        if (!base64Image) {
            throw new Error("Falha ao converter Canvas para Base64.");
        }
        
        return base64Image;

    } catch (error) {
        console.error("Erro na conversão PDF para Base64 (pdfjs + canvas):", error);
        throw new Error("Falha ao processar o PDF. Verifique a compatibilidade do 'canvas' com a Hostinger.");
    }
}