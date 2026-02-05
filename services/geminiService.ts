import { GoogleGenAI, Type } from "@google/genai";
import { HairAnalysis, Salon, GeoLocation } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to strip base64 prefix
const cleanBase64 = (b64: string) => b64.replace(/^data:image\/\w+;base64,/, "");

/**
 * Generates a preview image of the user with the target hairstyle.
 * Uses gemini-2.5-flash-image for image editing/generation capabilities.
 */
export const generateHairstylePreview = async (
  currentPhoto: string,
  targetPhoto: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `You are an expert Virtual Hair Stylist and Image Editor.

            TASK: Apply the hairstyle from Image 2 onto the person in Image 1.

            STRICT REQUIREMENTS:
            1. **Base Image (Image 1)**: Keep the face, skin, expression, clothing, pose, lighting, and background of Image 1 EXACTLY as they are. The person's identity must not change.
            2. **Target Style (Image 2)**: Extract the hairstyle (cut, texture, volume, shape, color) from Image 2.
            3. **Transformation**:
               - Completely replace the hair of the person in Image 1 with the style from Image 2.
               - **CRITICAL**: The new hair must look realistic and natural on the user's head.
               - **IMPORTANT**: You MUST change the hair silhouette/outline. If the target style is voluminous, long, or short, the result must reflect that volume and length, even if it covers or reveals more of the background than the original hair.
               - Blend the hair edges seamlessly with the existing background and forehead.
               - Match the lighting of the new hair to the environment of Image 1.

            OUTPUT: A high-quality photorealistic image of the person from Image 1 wearing the hairstyle from Image 2.
            `
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64(currentPhoto)
            }
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64(targetPhoto)
            }
          }
        ]
      },
      config: {
        candidateCount: 1
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Preview generation failed:", error);
    return null; // Fail gracefully, we can still show text analysis
  }
};

/**
 * Analyzes the two photos to provide professional advice.
 * Uses gemini-3-flash-preview for fast, structured reasoning.
 */
export const analyzeHairCompatibility = async (
  currentPhoto: string,
  targetPhoto: string
): Promise<HairAnalysis> => {
  const prompt = `
    Analyze these two images. Image 1 is the user's current hair. Image 2 is the desired style.
    Provide a JSON response with the following fields in Korean:
    - growthAdvice: How much does the user need to grow their hair (in cm or months) or is a cut needed? Be specific and answer in Korean.
    - technique: One of 'perm', 'dry', 'cut', 'color'. Which is most critical for this look?
    - techniqueDetails: Explain if this needs a specific perm (e.g., iron perm, setting perm) or just a blow-dry/wax styling. Answer in Korean.
    - stylistScript: A polite, professional script the user can show to a hairdresser to get this result without sounding bossy. Use professional terminology. (Korean).
    - styleKeywords: 2-3 keywords describing this specific style (e.g., 'Leaf Cut', 'Shadow Perm'). (Korean)
    - difficultyLevel: How hard is this to maintain at home? Answer in Korean (e.g., '쉬움', '보통', '어려움').
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(currentPhoto) } },
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(targetPhoto) } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          growthAdvice: { type: Type.STRING },
          technique: { type: Type.STRING, enum: ['perm', 'dry', 'cut', 'color'] },
          techniqueDetails: { type: Type.STRING },
          stylistScript: { type: Type.STRING },
          styleKeywords: { type: Type.STRING },
          difficultyLevel: { type: Type.STRING }
        },
        required: ["growthAdvice", "technique", "techniqueDetails", "stylistScript", "styleKeywords", "difficultyLevel"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No analysis generated");
  return JSON.parse(text) as HairAnalysis;
};

/**
 * Finds nearby salons using Google Search (to facilitate Naver/Kakao lookup).
 * Replaces googleMaps tool with googleSearch to avoid Google Maps dependency.
 */
export const findNearbySalons = async (
  location: GeoLocation,
  styleKeywords: string
): Promise<Salon[]> => {
  try {
    // Uses gemini-3-flash-preview with strict prompting to ensure real results are returned via Google Search.
    const prompt = `
      Context: The user is located at Latitude ${location.latitude}, Longitude ${location.longitude} in South Korea.
      
      Task: 
      1. Use Google Search to identify the specific Korean administrative district name (Dong/Gu) for these coordinates.
      2. Then, search specifically for "Hair Salons" (미용실) combined with that district name (e.g., "Yeoksam-dong Hair Salon").
      3. Look for real, operating businesses. If possible, find salons with good reviews for '${styleKeywords}'.
      
      CRITICAL INSTRUCTION:
      - You MUST extract REAL business names and addresses from the Google Search results.
      - Do NOT hallucinate or invent salon names. If you are unsure, do not list it.
      - Return exactly 5 salons found in the search.

      Output JSON format:
      - name: The exact Korean name of the salon.
      - address: The specific address found.
      - rating: (number) Rating score (e.g. 4.5). Use 0 if not found.
      - userRatingCount: (number) Number of reviews. Use 0 if not found.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Real name of the salon from search results" },
              address: { type: Type.STRING, description: "Real address of the salon" },
              userRatingCount: { type: Type.NUMBER, description: "Number of reviews" },
              rating: { type: Type.NUMBER, description: "Rating score" }
            },
            required: ["name", "address"]
          }
        }
      }
    });

    if (response.text) {
      const salons = JSON.parse(response.text) as Salon[];
      return salons.slice(0, 5);
    }
    
    return [];
  } catch (error) {
    console.error("Salon search failed", error);
    return [];
  }
};