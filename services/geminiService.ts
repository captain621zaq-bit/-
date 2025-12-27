
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const generateHeroImage = async (prompt: string): Promise<{ base64: string; text?: string }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3",
      },
    },
  });

  let base64 = '';
  let textResponse = '';

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      base64 = part.inlineData.data;
    } else if (part.text) {
      textResponse = part.text;
    }
  }

  if (!base64) {
    throw new Error('Failed to generate image data.');
  }

  return { base64, text: textResponse };
};

export const editHeroImage = async (base64Image: string, editPrompt: string): Promise<{ base64: string; text?: string }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png',
          },
        },
        {
          text: editPrompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3",
      },
    },
  });

  let base64 = '';
  let textResponse = '';

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      base64 = part.inlineData.data;
    } else if (part.text) {
      textResponse = part.text;
    }
  }

  if (!base64) {
    throw new Error('Failed to edit image data.');
  }

  return { base64, text: textResponse };
};
