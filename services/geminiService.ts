import { GoogleGenAI, Type } from "@google/genai";
import { SafetyAdvice } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSafetyIssue = async (failedItems: string[], equipmentModel: string): Promise<SafetyAdvice> => {
  try {
    const prompt = `
      An operator is performing a pre-shift checklist on a ${equipmentModel}.
      The following items were marked as FAILED/UNSAFE: ${failedItems.join(', ')}.
      
      Provide a safety assessment. 
      Determine the severity (low, medium, high).
      Provide a concise message for the operator.
      List 2-3 specific action items (e.g., "Tag out machine", "Contact maintenance").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            message: { type: Type.STRING },
            actionItems: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ['severity', 'message', 'actionItems']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as SafetyAdvice;

  } catch (error) {
    console.error("Error analyzing safety issue:", error);
    return {
      severity: 'high',
      message: 'System error analyzing safety risk. Treat as high severity.',
      actionItems: ['Do not operate', 'Contact supervisor manually']
    };
  }
};

export const generateShiftSummary = async (sessionDurationMin: number, operator: string, equipment: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a brief, encouraging post-shift summary for operator ${operator} who just finished a ${sessionDurationMin} minute shift on ${equipment}. Keep it professional yet friendly (max 2 sentences).`,
    });
    return response.text || "Shift completed successfully.";
  } catch (e) {
    return "Shift completed successfully.";
  }
};