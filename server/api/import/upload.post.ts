import { readMultipartFormData } from "h3";
import OpenAI from "openai";
import * as pdfjs from "pdfjs-dist/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    const file = form?.[0];

    if (!file) return { items: [] };

    const pdfBuffer = file.data;

    const pdf = await pdfjs.getDocument({ data: pdfBuffer }).promise;

    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      const viewport = page.getViewport({ scale: 2 });
      const canvasFactory = new pdfjs.NodeCanvasFactory();

      const canvasAndContext = canvasFactory.create(
        viewport.width,
        viewport.height
      );

      await page.render({
        canvasContext: canvasAndContext.context,
        viewport,
        canvasFactory,
      }).promise;

      const pngBuffer = canvasAndContext.canvas.toBuffer("image/png");
      pages.push(pngBuffer.toString("base64"));
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Extraia produtos e preços. Responda somente JSON:
[
  { "name": "", "cost": 0, "markup": 40, "price": 0 }
]
`;

    const images = pages.map((base64) => ({
      type: "input_image",
      image_url: `data:image/png;base64,${base64}`,
    }));

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini-vision",
      messages: [
        { role: "user", content: [...images, { type: "text", text: prompt }] },
      ],
    });

    let items = [];

    try {
      items = JSON.parse(response.choices[0].message?.content || "[]");
    } catch {}

    return { items };
  } catch (e) {
    console.error(e);
    return { items: [] };
  }
});
