
import { GoogleGenAI } from "@google/genai";
import type { ExtractionType } from '../App';

const getPrompt = (extractionType: ExtractionType): string => {
  if (extractionType === 'printed') {
    return `
      Extract all printed text from this image. 
      Preserve the original formatting, including headings, paragraphs, lists, bold text, italics, and layout. 
      Provide the output as clean, semantic HTML.
      - Use <h1>, <h2>, etc. for headings.
      - Use <p> for paragraphs.
      - Use <ul>/<ol> and <li> for lists.
      - Use <strong> for bold and <em> for italics.
      - Do not include <html>, <head>, or <body> tags.
      - Ensure the HTML is well-formed.
      - If there are tables, try to represent them with <table>, <tr>, <td> tags.
    `;
  }
  return `
    Act as an expert paleographer and handwriting recognition specialist.
    Extract all handwritten text from this image. 
    Instructions:
    1. Transcribe the text accurately, even if it is cursive or messy.
    2. Maintain the original structure, including line breaks and paragraph separations.
    3. If a word is illegible, mark it as [unclear].
    4. Provide the output as plain text, but use simple Markdown for basic structure (like headers if they look like headers).
  `;
};

/**
 * Extracts text from an image using Gemini 3 Flash.
 * The GoogleGenAI class MUST be instantiated with 'new'.
 */
export const extractTextFromImage = async (mimeType: string, base64Data: string, extractionType: ExtractionType): Promise<string> => {
  // Use 'new' as strictly required by the Gemini SDK
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: getPrompt(extractionType),
          },
        ],
      },
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("The AI returned an empty response. The image might be too blurry or contains no recognizable text.");
    }

    return text;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    
    // Check for common constructor/initialization errors
    if (error?.message?.includes('constructor')) {
        throw new Error("AI Initialization failed: Ensure the browser supports modern ES6 classes.");
    }
    
    if (error?.message?.includes('API_KEY')) {
      throw new Error("Missing or invalid API key configuration.");
    }
    
    throw new Error(error?.message || "An unexpected error occurred during image analysis.");
  }
};
