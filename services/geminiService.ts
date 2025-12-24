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

  const isSeniorLevel = gradeLevel === 'High School' || gradeLevel === 'University';

  const systemInstruction = `
    You are an expert senior academic content developer for "Homework Hero". 
    Your mission is to generate a rigorous, fack-checked, and professional worksheet.
    
    ACADEMIC RIGOR & TONE:
    - Grade Level: ${gradeLevel}
    - Difficulty: ${difficulty}
    - Language: ${language}
    - For ${gradeLevel} and above, the tone must be serious, professional, and dense. Avoid "fun" or juvenile language.
    - Factual accuracy is paramount. Use precise academic terminology.

    NO-TRACING RULE FOR SENIOR LEVELS:
    - If the Grade Level is "High School" or "University":
      - DO NOT generate any "tracing" or "copying" tasks. 
      - Even if the user requests DRILL types, transform them into rigorous analytical questions. 
      - Character/Sentence drills are strictly for primary education and MUST NOT appear in senior worksheets.
      - Instead of tracing, focus on deep conceptual understanding, synthesis of information, and critical analysis.

    TITLE RULE:
    - If a specific title is provided: "${customTitle || 'None'}", use it.
    - If no title is provided, generate a formal academic title based on the topic.

    QUESTION MIX (Mandatory counts):
${countInstruction}
    
    5. Types definition:
       - MCQ: Multiple choice (4 rigorous options)
       - TF: True/False (Factually challenging)
       - SHORT_ANSWER: Open response / Analytical essay
       - VOCABULARY: Advanced terminology in context
       - CHARACTER_DRILL: (Junior only) Single character practice
       - SYMBOL_DRILL: (Junior/STEM) Symbol practice
       - SENTENCE_DRILL: (Junior only) Narrative flow tracing

    6. Challenges: Mark complex, multi-step, or abstract reasoning items with "isChallenge: true".
    7. Context: Synthesize all inputs (scans, text) into a logical and challenging academic assessment.
  `;

  parts.push({ text: systemInstruction });

  if (fileData) {
    parts.push({ 
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
    parts.push({ text: "SOURCE MATERIAL: Analyze the provided document for key academic concepts and data points." });
  }

  if (rawText) {
    parts.push({ text: `REFERENCE TEXT:\n---\n${rawText}\n---` });
  }

  parts.push({ text: `INSTRUCTIONAL FOCUS: ${topic}` });

  // Use gemini-3-pro-preview for senior academic rigor
  const response = await ai.models.generateContent({
    model: isSeniorLevel ? "gemini-3-pro-preview" : "gemini-3-flash-preview",
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
    if (customTitle && customTitle.trim() !== "") {
      data.title = customTitle;
    }
    return data as Worksheet;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Failed to generate content.");
  }
}