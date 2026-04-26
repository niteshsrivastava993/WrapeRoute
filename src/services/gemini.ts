import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface WrapperAnalysis {
  brand: string;
  plasticType: "Rigid" | "Flexible" | "Mixed";
  physicalState: "Crushed" | "Open" | "Sealed";
  confidence: number;
}

export async function analyzeWrapper(base64Image: string): Promise<WrapperAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this image of a plastic wrapper. 
  Identify the brand if visible.
  Determine the type of plastic (Rigid, Flexible, or Mixed).
  Identify the physical state of the wrapper (Crushed, Open, or Sealed).
  Provide a confidence score between 0 and 1.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING },
          plasticType: { type: Type.STRING, enum: ["Rigid", "Flexible", "Mixed"] },
          physicalState: { type: Type.STRING, enum: ["Crushed", "Open", "Sealed"] },
          confidence: { type: Type.NUMBER }
        },
        required: ["brand", "plasticType", "physicalState", "confidence"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return {
      brand: "Unknown",
      plasticType: "Flexible",
      physicalState: "Open",
      confidence: 0
    };
  }
}
