
import { GoogleGenAI, Type } from "@google/genai";
import { Worksheet, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GenerationOptions {
  topic?: string;
  gradeLevel: string;
  numQuestions: number;
  rawText?: string;
  fileData?: { data: string; mimeType: string };
  difficulty: string;
  language: string;
}

export async function generateWorksheet(options: GenerationOptions): Promise<Worksheet> {
  const { topic, gradeLevel, numQuestions, rawText, fileData, difficulty, language } = options;

  let promptPrefix = "";
  let contents: any[] = [];

  if (fileData) {
    promptPrefix = `Analyze the provided document/image and generate a high-quality academic worksheet based on its content.`;
    contents = [
      {
        inlineData: fileData
      },
      {
        text: `${promptPrefix} 
        The worksheet should be for "${gradeLevel}" level with a "${difficulty}" difficulty in "${language}" language.
        Include exactly ${numQuestions} items. 
        Mix items between: MCQ, TF, CHARACTER_DRILL, SYMBOL_DRILL, SENTENCE_DRILL, SHORT_ANSWER, VOCABULARY.
        Ensure some items are marked as "isChallenge: true".`
      }
    ];
  } else if (rawText) {
    promptPrefix = `Create a worksheet based EXACTLY on the following content or questions provided by the user: 
    ---
    ${rawText}
    ---`;
    contents = [
      {
        text: `${promptPrefix}
        Format this content into a beautiful worksheet for "${gradeLevel}" level. 
        If the input is just notes, create questions from them. If the input is already questions, preserve them but format correctly.
        Include exactly ${numQuestions} items if possible.
        Difficulty: ${difficulty}. Language: ${language}.
        Map items to: MCQ, TF, CHARACTER_DRILL, SYMBOL_DRILL, SENTENCE_DRILL, SHORT_ANSWER, VOCABULARY.`
      }
    ];
  } else {
    promptPrefix = `Generate a high-quality academic worksheet for the topic "${topic}".`;
    contents = [
      {
        text: `${promptPrefix}
        Suitable for "${gradeLevel}" level. 
        Difficulty: ${difficulty}. Language: ${language}.
        Include exactly ${numQuestions} items. 
        Mix items between: MCQ, TF, CHARACTER_DRILL, SYMBOL_DRILL, SENTENCE_DRILL, SHORT_ANSWER, VOCABULARY.
        Ensure some items are marked as "isChallenge: true".`
      }
    ];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: contents },
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
                  description: "Must be one of: MCQ, TF, SHORT_ANSWER, VOCABULARY, CHARACTER_DRILL, SYMBOL_DRILL, SENTENCE_DRILL"
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
    const data = JSON.parse(response.text);
    return data as Worksheet;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Failed to generate content. Please try again.");
  }
}
