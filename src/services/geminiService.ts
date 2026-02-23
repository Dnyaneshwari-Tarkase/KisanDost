import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface LanguageSpecificData {
  Crop: string;
  Condition: string;
  Causes: string[];
  Treatment: {
    Chemical: string[];
    Organic: string[];
  };
  PreventionTips: string[];
  Summary: string;
}

export interface DiagnosisResult {
  Confidence: string;
  Severity: "Low" | "Medium" | "High";
  ImmediateActionRequired: "Yes" | "No";
  Languages: {
    English: LanguageSpecificData;
    Marathi: LanguageSpecificData;
    Hindi: LanguageSpecificData;
  };
}

export async function analyzeCropImage(base64Image: string, mimeType: string, symptoms?: string): Promise<DiagnosisResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `Analyze the uploaded image of a crop (leaf, stem, fruit) and provide a detailed, structured report to help farmers take action.
  
  ${symptoms ? `The farmer has also provided these symptoms: "${symptoms}"` : ""}
  
  Requirements:
  1. Identify the crop name.
  2. Detect disease (if any) and provide the disease name. If healthy, state "No disease detected" for Condition.
  3. Provide confidence level (percentage) of your prediction.
  4. Assess severity (Low / Medium / High) of the disease on the plant.
  5. List possible causes of the disease.
  6. Recommend actionable treatment options:
     - Include chemical options (with concentration/dosage if applicable)
     - Include organic/natural remedies
  7. Provide simple, practical prevention tips for future crops.
  8. Indicate whether immediate action is required (Yes / No).
  9. Support multi-language output: Marathi, Hindi, and English for EVERY field (Crop, Condition, Causes, Treatment, PreventionTips, and a Summary).
  10. Make each explanation simple, step-by-step, and easy to understand. Avoid technical jargon.
  11. If confidence is below 60%, include: "Consult local agriculture expert for confirmation." in the summaries.
  
  Output MUST be in JSON format matching the schema provided. Ensure translations are accurate and culturally appropriate for farmers.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image.split(",")[1], // Remove data:image/png;base64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          Confidence: { type: Type.STRING },
          Severity: { type: Type.STRING },
          ImmediateActionRequired: { type: Type.STRING },
          Languages: {
            type: Type.OBJECT,
            properties: {
              English: {
                type: Type.OBJECT,
                properties: {
                  Crop: { type: Type.STRING },
                  Condition: { type: Type.STRING },
                  Causes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Treatment: {
                    type: Type.OBJECT,
                    properties: {
                      Chemical: { type: Type.ARRAY, items: { type: Type.STRING } },
                      Organic: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["Chemical", "Organic"],
                  },
                  PreventionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Summary: { type: Type.STRING },
                },
                required: ["Crop", "Condition", "Causes", "Treatment", "PreventionTips", "Summary"],
              },
              Marathi: {
                type: Type.OBJECT,
                properties: {
                  Crop: { type: Type.STRING },
                  Condition: { type: Type.STRING },
                  Causes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Treatment: {
                    type: Type.OBJECT,
                    properties: {
                      Chemical: { type: Type.ARRAY, items: { type: Type.STRING } },
                      Organic: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["Chemical", "Organic"],
                  },
                  PreventionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Summary: { type: Type.STRING },
                },
                required: ["Crop", "Condition", "Causes", "Treatment", "PreventionTips", "Summary"],
              },
              Hindi: {
                type: Type.OBJECT,
                properties: {
                  Crop: { type: Type.STRING },
                  Condition: { type: Type.STRING },
                  Causes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Treatment: {
                    type: Type.OBJECT,
                    properties: {
                      Chemical: { type: Type.ARRAY, items: { type: Type.STRING } },
                      Organic: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["Chemical", "Organic"],
                  },
                  PreventionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Summary: { type: Type.STRING },
                },
                required: ["Crop", "Condition", "Causes", "Treatment", "PreventionTips", "Summary"],
              },
            },
            required: ["English", "Marathi", "Hindi"],
          },
        },
        required: ["Confidence", "Severity", "ImmediateActionRequired", "Languages"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return result as DiagnosisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
}
