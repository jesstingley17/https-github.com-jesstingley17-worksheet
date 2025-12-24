
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
  pageTarget?: number;
}

export interface AnalysisResult {
  suggestedTitle: string;
  suggestedTopicScope: string;
}

export async function analyzeSourceMaterial(
  fileData?: { data: string; mimeType: string },
  rawText?: string
): Promise<AnalysisResult | null> {
  const parts: any[] = [];
  
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const promptText = `
    You are an expert academic analyst. 
    Analyze the provided content (text or image) and suggest a formal worksheet title and a specific topic scope.
    
    ${rawText ? `Additional Context: ${rawText}` : ''}
    
    Return the result in JSON format:
    {
      "suggestedTitle": "A concise, academic title (e.g., 'Introduction to Quantum Mechanics')",
      "suggestedTopicScope": "A 1-2 sentence description of exactly what sub-topics are covered."
    }
  `;
  
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            suggestedTopicScope: { type: Type.STRING }
          },
          required: ["suggestedTitle", "suggestedTopicScope"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data as AnalysisResult;
  } catch (error) {
    console.error("Failed to analyze source material", error);
    return null;
  }
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
  const { topic, customTitle, gradeLevel, difficulty, language, questionCounts, rawText, fileData, pageTarget = 1 } = options;

  let parts: any[] = [];
  
  const countInstruction = Object.entries(questionCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => `- ${count} items of type ${type}`)
    .join('\n');

  const isSeniorLevel = gradeLevel === 'High School' || gradeLevel === 'University' || gradeLevel === 'University / College' || gradeLevel === 'Professional / Adult';

  const systemInstruction = `
    You are an elite academic curriculum designer. Your goal is to produce university-entrance level assessment materials.
    
    ACADEMIC RIGOR & TONE:
    - Grade Level: ${gradeLevel}
    - Difficulty Level: ${difficulty}
    - Language: ${language}
    - Target Length: ${pageTarget} Page(s). Ensure the complexity and depth of the items scale to fill this volume.
    - For Senior levels: The assessment must be academically rigorous, intellectually demanding, and factually flawless.
    - Use high-level academic vocabulary and complex sentence structures in the questions.
    - Focus on synthesis, evaluation, and critical analysis rather than simple recall.

    STRICT SENIOR LEVEL RULES:
    1. NO TRACING: Never generate tasks that involve tracing letters or words.
    2. NO COPYING: Never ask the student to "copy the question" or "rewrite the sentence exactly".
    3. TRANSFORMATION: If "Drill" types are requested for senior levels, transform them into "Formula Application" or "Data Interpretation" tasks.
    4. NO JUVENILE CONTENT: Remove all mentions of "fun", "games", or "puzzles".
    5. Factual Accuracy: All information must be strictly accurate.

    TITLE:
    - Title should be: "${customTitle || 'Advanced Academic Assessment: ' + topic}"

    ITEM DISTRIBUTION:
${countInstruction}
    
    TYPES DEFINITION:
       - MCQ: Complex distractors requiring logical elimination.
       - TF: Subtle, nuanced statements that test edge cases of a concept.
       - SHORT_ANSWER: Multi-sentence analytical justifications or proofs.
       - VOCABULARY: Etymology, nuanced usage, or discipline-specific jargon in context.
       - DRILLS: Only for Junior levels. For Senior, ignore tracing and make them short-form proofs or identifications.

    COMPLEXITY MARKER:
    Set "isChallenge: true" for items that require abstract reasoning or cross-disciplinary knowledge.

    OUTPUT VOLUME:
    You are requested to target ${pageTarget} page(s) of content. If more than 1 page is requested, make the questions more comprehensive, add detailed preambles to sections, and ensure explanations are thorough.
  `;

  parts.push({ text: systemInstruction });

  if (fileData) {
    parts.push({ 
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
    parts.push({ text: "ANALYSIS TASK: Deconstruct the uploaded source material and integrate its most complex data/theory points into the assessment." });
  }

  if (rawText) {
    parts.push({ text: `REFERENCE CORPUS:\n---\n${rawText}\n---` });
  }

  parts.push({ text: `PRIMARY FOCUS AREA: ${topic}` });

  // Use Pro for Senior Level or if file data is complex
  const modelToUse = isSeniorLevel ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelToUse,
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
                type: { type: Type.STRING },
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
    throw new Error("Assessment generation failed due to data inconsistency.");
  }
}
