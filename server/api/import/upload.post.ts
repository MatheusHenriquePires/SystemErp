import { PDFDocument } from 'pdf-lib';

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    const file = form?.find(f => f.name === 'file');

    if (!file) return { error: 'Arquivo não enviado.' };

    const pdfDoc = await PDFDocument.load(file.data);
    const pages = pdfDoc.getPageCount();

    return {
      sucesso: true,
      paginas: pages
    };

  } catch (err) {
    console.error(err);
    return { error: 'Falha ao processar PDF.' };
  }
});
