
import { GoogleGenAI, Type } from "@google/genai";
import { EtymologyInfo } from "../types";

/**
 * Busca dados etimológicos usando a API do Gemini.
 * A API_KEY deve ser configurada no painel da Vercel como variável de ambiente.
 */
export const getEtymologyData = async (word: string): Promise<EtymologyInfo> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY não encontrada. Configure a variável de ambiente no dashboard da Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explique detalhadamente a etimologia da palavra "${word}". Foque em desmentir mitos populares se existirem (como o de que 'aluno' significa 'sem luz') e apresente a origem científica (latim, grego, etc). Responda em Português do Brasil.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          origin: { type: Type.STRING, description: "Língua e raiz original" },
          myth: { type: Type.STRING, description: "Mitos comuns sobre essa palavra" },
          truth: { type: Type.STRING, description: "A explicação etimológica real" },
          context: { type: Type.STRING, description: "Evolução histórica" },
          funFact: { type: Type.STRING, description: "Uma curiosidade linguística" },
        },
        required: ["word", "origin", "truth", "context"],
      },
    },
  });

  try {
    const text = response.text;
    if (!text) throw new Error("A IA retornou uma resposta vazia.");
    return JSON.parse(text) as EtymologyInfo;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Não foi possível processar a etimologia. Verifique se a palavra é válida.");
  }
};
