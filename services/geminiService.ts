
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
  includeTracing?: boolean;
  includeDiagram?: boolean;
  diagramLabelType?: 'LABELED' | 'BLANK';
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

export async function generateDoodles(topic: string, gradeLevel: string): Promise<string[]> {
  const isSenior = gradeLevel.includes('High School') || gradeLevel.includes('University') || gradeLevel.includes('Professional');
  const style = isSenior ? "technical diagrams, minimalist scientific icons, and neat marginalia" : "cute, friendly, thick-lined cartoon icons and simple educational symbols";
  
  const prompt = `A grid of 4 separate, distinct, high-quality black and white hand-drawn line art doodles. 
  Theme: ${topic}. 
  Style: ${style}. 
  Important: The doodles must be isolated on a pure white background, no shading, bold outlines only. Do not include any text. Each doodle should be about a different aspect of ${topic}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return [`data:image/png;base64,${part.inlineData.data}`];
      }
    }
  } catch (e) {
    console.error("Doodle generation failed", e);
  }
  return [];
}

export async function generateWorksheet(options: GenerationOptions): Promise<Worksheet> {
  const { 
    topic, 
    customTitle, 
    gradeLevel, 
    difficulty, 
    language, 
    questionCounts, 
    rawText, 
    fileData, 
    pageTarget = 1, 
    includeTracing = false,
    includeDiagram = false,
    diagramLabelType = 'LABELED'
  } = options;

  const isPreschool = gradeLevel.includes("Preschool");
  let diagramImageBase64 = '';

  // Generate Diagram if requested and not preschool
  if (includeDiagram && !isPreschool) {
    const labelInstruction = diagramLabelType === 'BLANK' 
      ? "Include clear arrows or lines pointing to key components, but leave the label text areas completely blank or empty so students can write them in."
      : "Include clear, professional text labels for all key components and parts.";
    
    const diagramPrompt = `A high-quality, academic technical diagram for ${topic} at a ${gradeLevel} level. Style: Scientific line art, black and white, clean and professional. ${labelInstruction} The background must be pure white. No shading, just bold, clean outlines.`;

    try {
      const diagResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: diagramPrompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      for (const part of diagResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          diagramImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (e) {
      console.error("Diagram generation failed", e);
    }
  }

  if (isPreschool) {
    // Specialized preschool logic: Generate a coloring page with NO text inside the image
    const imagePrompt = `A high-quality, simple, bold black and white line art coloring page for a preschool child. The subject is: ${topic}. Big, clear shapes, clean outlines only. IMPORTANT: The image must contain NO text, NO words, NO labels, and NO letters inside the drawing area. Only visual line art.`;
    
    try {
      const imgResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: imagePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let coloringImageBase64 = '';
      for (const part of imgResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          coloringImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      let questions: any[] = [];
      if (includeTracing) {
        const tracingPrompt = `For a preschool child learning about "${topic}", suggest 2 very simple words related to it for tracing practice.
        Return in JSON format:
        {
          "tracingItems": ["WORD1", "WORD2"]
        }`;

        const textResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: tracingPrompt,
          config: { 
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                tracingItems: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["tracingItems"]
            }
          }
        });

        const tracingData = JSON.parse(textResponse.text || '{}');
        questions = (tracingData.tracingItems || []).map((text: string, i: number) => ({
          id: `trace-${i}`,
          type: QuestionType.SENTENCE_DRILL,
          question: `Trace: ${text}`,
          correctAnswer: text,
          explanation: "Fine motor skill development.",
          isChallenge: false
        }));
      }

      return {
        title: customTitle || `Coloring Page: ${topic}`,
        topic: topic,
        educationalLevel: gradeLevel,
        questions: questions,
        coloringImage: coloringImageBase64
      };
    } catch (e) {
      console.error("Preschool generation failed", e);
      return {
        title: customTitle || `Coloring Activity: ${topic}`,
        topic: topic,
        educationalLevel: gradeLevel,
        questions: []
      };
    }
  }

  // Standard Logic for other levels
  let parts: any[] = [];
  
  const countInstruction = Object.entries(questionCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => `- ${count} items of type ${type}`)
    .join('\n');

  const isSeniorLevel = gradeLevel === 'High School' || gradeLevel === 'University / College' || gradeLevel === 'Professional / Adult';
  const isAdvancedLevel = gradeLevel === 'University / College' || gradeLevel === 'Professional / Adult';

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

    ${isAdvancedLevel ? `
    ADVANCED LEVEL SPECIAL INSTRUCTIONS (University/Professional):
    - Abstract Reasoning: Design questions that require applying theoretical frameworks to novel, abstract, or highly technical scenarios.
    - Complex Problem Solving: For technical topics, include multi-step problems that involve variables, derivation, or complex logical chains.
    - Detailed Explanations: The "explanation" field for each question must be an academic-grade paragraph. It should explain the conceptual underpinnings, why the correct answer is logically necessary, and common theoretical pitfalls.
    - Case Study Context: For professional levels, frame questions within realistic industry case studies or advanced research contexts.
    ` : ''}

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
    // Assign generated diagram if any
    const finalWorksheet = data as Worksheet;
    if (diagramImageBase64) {
      finalWorksheet.diagramImage = diagramImageBase64;
    }
    return finalWorksheet;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Assessment generation failed due to data inconsistency.");
  }
}
