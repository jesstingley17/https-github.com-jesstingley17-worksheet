
import { GoogleGenAI, Type } from "@google/genai";
import { Worksheet, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GenerationOptions {
  topic: string; 
  customTitle?: string;
  gradeLevel: string;
  difficulty: string;
  language: string;
  questionCounts: Record<string, number>;
  rawText?: string;
  fileData?: { data: string; mimeType: string };
}

export async function generateTopicScopeSuggestion(title: string, ageGroup: string): Promise<string> {
  const prompt = `
    Generate a concise, 1-2 sentence educational "topic scope" for a worksheet.
    Title: "${title}"
    Target Age Group: "${ageGroup}"
    
    The scope should describe what the student will learn or practice. 
    Example: "Students will explore the stages of photosynthesis and identify the role of chlorophyll in plant energy production."
    
    Return only the plain text scope.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Failed to generate topic scope suggestion", error);
    return "";
  }
}

export async function generateWorksheet(options: GenerationOptions): Promise<Worksheet> {
  const { topic, customTitle, gradeLevel, difficulty, language, questionCounts, rawText, fileData } = options;

  let parts: any[] = [];
  
  const countInstruction = Object.entries(questionCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => `- ${count} items of type ${type}`)
    .join('\n');

  const systemInstruction = `
    You are an expert educational content creator for "Homework Hero". 
    Your mission is to generate a high-quality, professional worksheet.
    
    TITLE RULE:
    - If a specific title is provided: "${customTitle || 'None'}", use it.
    - If no title is provided, generate a creative and relevant title based on the topic.

    RULES:
    1. Grade Level: ${gradeLevel}
    2. Difficulty: ${difficulty}
    3. Language: ${language}
    4. QUESTION MIX (Mandatory counts):
${countInstruction}
    
    5. Types definition:
       - MCQ: Multiple choice (4 options)
       - TF: True/False
       - SHORT_ANSWER: Open response / Essay (No tracing, just provide the prompt)
       - VOCABULARY: Word and its definition (Can be used for practice/tracing if requested)
       - CHARACTER_DRILL: Single character practice
       - SYMBOL_DRILL: Math/Science symbol practice
       - SENTENCE_DRILL: Full sentence practice

    6. Tracing: If the user specifically asks for "tracing" in the topic or instructions, ensure VOCABULARY and SENTENCE_DRILL items have clear, copyable reference text.
    7. Challenges: Mark complex items with "isChallenge: true".
    8. Continuity: Synthesize all inputs into a single logical learning path.
  `;

  parts.push({ text: systemInstruction });

  if (fileData) {
    parts.push({ 
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
    parts.push({ text: "SCANNED DOCUMENT DATA: Analyze the attached image/PDF for primary facts." });
  }

  if (rawText) {
    parts.push({ text: `PASTED CONTENT: Use this text as source:\n---\n${rawText}\n---` });
  }

  parts.push({ text: `TOPIC/INSTRUCTIONS: ${topic}` });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          topic: { type: Type.STRING },
          gradeLevel: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { 
                  type: Type.STRING,
                  description: "Must be one of the specified types"
                },
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                isChallenge: { type: Type.BOOLEAN }
              },
              required: ["id", "type", "question", "correctAnswer", "explanation", "isChallenge"]
            }
          }
        },
        required: ["title", "topic", "gradeLevel", "questions"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    // If user provided a title, override whatever the AI thought
    if (customTitle && customTitle.trim() !== "") {
      data.title = customTitle;
    }
    return data as Worksheet;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Failed to generate content.");
  }
}
