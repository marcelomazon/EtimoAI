
import { GoogleGenAI, Type } from "@google/genai";
import { EtymologyInfo } from "../types";

/**
 * Busca dados etimológicos usando a API do Gemini.
 * A API_KEY é obtida exclusivamente via process.env.API_KEY.
 */
export const getEtymologyData = async (word: string): Promise<EtymologyInfo> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Configuração ausente: A variável de ambiente API_KEY não foi encontrada. Certifique-se de configurá-la no painel do Vercel.");
  }

  // Instanciação dinâmica para garantir que pegamos o valor correto do ambiente em cada chamada
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explique a etimologia da palavra "${word}". Foque em desmentir mitos se existirem (especialmente o mito de que "aluno" significa "sem luz") e forneça a origem real do latim, grego ou outras línguas.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          origin: { type: Type.STRING, description: "Língua e raiz original da palavra" },
          myth: { type: Type.STRING, description: "Mitos comuns sobre essa palavra, se houver" },
          truth: { type: Type.STRING, description: "A explicação real e científica da etimologia" },
          context: { type: Type.STRING, description: "Como a palavra evoluiu até hoje" },
          funFact: { type: Type.STRING, description: "Uma curiosidade extra" },
        },
        required: ["word", "origin", "truth", "context"],
      },
    },
  });

  try {
    const data = JSON.parse(response.text);
    return data as EtymologyInfo;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Erro ao processar a resposta da IA. Verifique os limites da sua chave de API.");
  }
};
