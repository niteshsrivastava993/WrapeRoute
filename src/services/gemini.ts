import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface WrapperAnalysis {
  brand: string;
  plasticType: "Rigid" | "Flexible" | "Mixed";
  physicalState: "Crushed" | "Open" | "Sealed";
  confidence: number;
}

export async function analyzeWrapper(base64Image: string): Promise<WrapperAnalysis> {
  const prompt = `Analyze this image of a plastic wrapper. 
  Identify the brand if visible.
  Determine the type of plastic (Rigid, Flexible, or Mixed).
  Identify the physical state of the wrapper (Crushed, Open, or Sealed).
  Return a JSON object with keys: brand, plasticType, physicalState, confidence.`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType: "image/jpeg"
        }
      },
      prompt
    ]);

    const response = await result.response;
    const text = response.text();
    // Clean up potential markdown formatting
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
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
