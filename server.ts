import "dotenv/config";
import express, { type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "20mb" }));

  app.post("/api/generate-ad", async (req: Request, res: Response) => {
    try {
      const { image } = req.body as { image?: string };

      if (!image || typeof image !== "string" || !image.includes(",")) {
        res.status(400).json({ error: "Imagem inválida ou não enviada." });
        return;
      }

      const [header, base64Data] = image.split(",", 2);
      const mimeMatch = header.match(/^data:([^;]+);base64$/);
      const mimeType = mimeMatch?.[1];

      if (!base64Data || !mimeType || !mimeType.startsWith("image/")) {
        res.status(400).json({ error: "Formato de imagem não suportado." });
        return;
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            parts: [
              {
                text: "Crie um anúncio de alta conversão para este produto. O anúncio deve ser persuasivo, destacar benefícios, usar gatilhos mentais e incluir uma chamada para ação (CTA) poderosa. Escreva em Português do Brasil.",
              },
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
            ],
          },
        ],
      });

      res.json({
        text: response.text || "Não foi possível gerar o anúncio.",
      });
    } catch (error) {
      console.error("Erro ao gerar anúncio:", error);
      const message =
        error instanceof Error ? error.message : "Erro ao processar solicitação.";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
