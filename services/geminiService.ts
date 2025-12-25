
import { GoogleGenAI, Type } from "@google/genai";
import { Worksheet, QuestionType, ThemeType } from "../types";

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
  theme?: ThemeType;
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
    diagramLabelType = 'LABELED',
    theme = ThemeType.CLASSIC
  } = options;

  const isPreschool = gradeLevel.includes("Preschool");
  const isInfographic = theme === ThemeType.CREATIVE && !isPreschool;
  const shouldGenerateDiagram = (includeDiagram || isInfographic) && !isPreschool;
  let diagramImageBase64 = '';

  // Generate Diagram if requested or in infographic mode (not preschool)
  if (shouldGenerateDiagram) {
    const labelInstruction = diagramLabelType === 'BLANK' && !isInfographic
      ? "The diagram must include clear arrows pointing to major components, but the label text areas MUST be left completely blank or replaced with empty boxes for students to manually fill in."
      : "The diagram must include clear, professional academic text labels for every major component and process.";
    
    const diagramPrompt = `Create a professional-grade, high-quality academic technical diagram for ${topic} at a ${gradeLevel} level. 
    Style requirements: Strictly black and white scientific line art, clean and professional execution, suitable for a university textbook or formal examination. 
    ${labelInstruction} 
    The background must be pure white (#FFFFFF). No shading, no greyscale, no gradients—just clean, bold black outlines on a white canvas. 
    Ensure the schematic is technically accurate and educational.`;

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

  const infographicInstruction = isInfographic ? `
    MODE: INFOGRAPHIC GENERATION.
    Instead of a traditional worksheet with questions, generate a "Visual Fact Sheet".
    The "questions" array should contain key thematic sections:
    - Each "question" should be a high-level educational section header.
    - The "correctAnswer" should be the primary content/fact for that section (1-3 detailed sentences).
    - The "explanation" should be a "Deep Dive" or "Fun Fact" related to the content.
    - Provide exactly 6 sections to fill an infographic layout.
  ` : '';

  const systemInstruction = `
    You are an elite academic curriculum designer.
    
    ACADEMIC RIGOR & TONE:
    - Grade Level: ${gradeLevel}
    - Difficulty Level: ${difficulty}
    - Language: ${language}
    - Target Length: ${pageTarget} Page(s).
    - For Senior levels: The material must be academically rigorous, intellectually demanding, and factually flawless.

    ${infographicInstruction}

    ${isAdvancedLevel ? `
    ADVANCED LEVEL SPECIAL INSTRUCTIONS (University/Professional):
    - Abstract Reasoning: Design content that requires applying theoretical frameworks to novel, abstract, or highly technical scenarios.
    - Detailed Explanations: Content must explain the conceptual underpinnings, why the fact is logically necessary, and common theoretical pitfalls.
    ` : ''}

    ${!isInfographic ? `
    STRICT SENIOR LEVEL RULES (ASSESSMENT MODE):
    1. NO TRACING.
    2. NO COPYING.
    3. TRANSFORMATION: Transform drills into formula application.
    4. ITEM DISTRIBUTION:
${countInstruction}
    ` : ''}

    ${shouldGenerateDiagram && !isInfographic ? `
    DIAGRAM INTEGRATION: 
    A professional technical diagram (Exhibit 1) has been provided for this worksheet. 
    You MUST include at least one question that specifically requires the student to interpret, analyze, or reference components of "Exhibit 1".
    ` : ''}

    TITLE:
    - Title should be: "${customTitle || (isInfographic ? 'Educational Infographic: ' + topic : 'Advanced Academic Assessment: ' + topic)}"

    TYPES DEFINITION (If not Infographic):
       - MCQ, TF, SHORT_ANSWER, VOCABULARY.

    OUTPUT VOLUME:
    Target ${pageTarget} page(s).
  `;

  parts.push({ text: systemInstruction });

  if (fileData) {
    parts.push({ 
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
    parts.push({ text: "ANALYSIS TASK: Deconstruct the uploaded source material and integrate its most complex data/theory points into the content." });
  }

  if (rawText) {
    parts.push({ text: `REFERENCE CORPUS:\n---\n${rawText}\n---` });
  }

  parts.push({ text: `PRIMARY FOCUS AREA: ${topic}` });

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
