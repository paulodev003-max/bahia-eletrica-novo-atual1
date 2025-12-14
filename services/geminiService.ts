import { GoogleGenAI, Type } from "@google/genai";
import { Product, Service } from "../types";

const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

// Type Guard
const isService = (item: Product | Service): item is Service => {
  return (item as Service).estimatedHours !== undefined;
};

export const getPricingAdvice = async (item: Product | Service): Promise<any> => {
  if (!apiKey) {
    console.warn("API Key is missing for Gemini");
    return { suggestedPrice: item.price, reasoning: "Chave de API ausente. Usando preço atual.", confidence: "Low", marketTrend: "Desconhecido" };
  }

  try {
    const margin = item.price > 0 ? ((item.price - item.cost) / item.price * 100).toFixed(2) : "0";
    
    let contextSpecificPrompt = "";

    if (isService(item)) {
      contextSpecificPrompt = `
        Contexto: Serviço Técnico Especializado (Elétrica/Automação).
        Serviço: ${item.name}
        Categoria: ${item.category}
        Custo Interno (Mão de Obra + Deslocamento): R$ ${item.cost}
        Preço Cobrado Atualmente: R$ ${item.price}
        Horas Estimadas: ${item.estimatedHours}h
        Descrição: ${item.description}
        Margem Atual: ${margin}%

        Considere:
        1. Complexidade técnica da mão de obra.
        2. Valor agregado de serviços de automação/elétrica.
        3. Preço médio de mercado para hora técnica.
      `;
    } else {
      contextSpecificPrompt = `
        Contexto: Venda de Produto (Varejo).
        Produto: ${item.name}
        Categoria: ${item.category}
        Custo de Compra: R$ ${item.cost}
        Preço de Venda Atual: R$ ${item.price}
        Margem Atual: ${margin}%
        Estoque: ${(item as Product).stock}
        Fornecedor: ${(item as Product).supplier}

        Considere:
        1. Competitividade no mercado de material elétrico.
        2. Giro de estoque e risco de obsolescência.
      `;
    }

    const prompt = `
      Atue como um especialista em precificação para a 'Bahia Elétrica & Automação'.
      Analise o seguinte item:
      
      ${contextSpecificPrompt}

      Sugira um preço ideal de venda buscando lucratividade sustentável.

      Retorne APENAS um JSON com o formato:
      {
        "suggestedPrice": number,
        "reasoning": string (Explicação curta e comercial em português),
        "confidence": "High" | "Medium" | "Low",
        "marketTrend": string (Ex: "Alta demanda", "Estável", "Queda", "Serviço Valorizado")
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPrice: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            marketTrend: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const generateInventoryInsight = async (products: Product[]): Promise<string> => {
  if (!apiKey) return "Insights de IA indisponíveis sem chave de API.";

  try {
    // Creating a lean summary to save tokens
    const summary = products.map(p => 
      `${p.name} (Qtd: ${p.stock}, Custo: ${p.cost}, Preço: ${p.price})`
    ).slice(0, 30).join('; ');

    const prompt = `
      Você é o gerente comercial da 'Bahia Elétrica & Automação'. 
      Analise esta lista resumida de estoque: [${summary}].
      
      Identifique 3 pontos críticos de atenção em Português do Brasil.
      Foque em:
      1. Produtos que podem estar com preço defasado.
      2. Riscos de ruptura de estoque.
      3. Sugestão de ação imediata.
      
      Seja direto e use bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nenhum insight gerado.";
  } catch (error) {
    console.error(error);
    return "Erro ao gerar análise.";
  }
};