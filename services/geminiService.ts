import {
  HairAnalysis,
  Salon,
  GeoLocation,
  PreviewResult,
  HairStylePreset,
} from "../types";

type GeminiAction = "preview" | "analysis" | "salons";

const requestGemini = async <T>(action: GeminiAction, payload: Record<string, any>): Promise<T> => {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || "Gemini request failed");
  }

  return response.json() as Promise<T>;
};

const presetPayload = (preset?: HairStylePreset | null) => {
  return preset ? { id: preset.id } : null;
};

export const generateHairstylePreview = async (
  currentPhoto: string,
  targetPhoto?: string | null,
  targetPreset?: HairStylePreset | null,
  targetPrompt?: string | null,
): Promise<PreviewResult> => {
  try {
    return requestGemini<PreviewResult>("preview", {
      currentPhoto,
      targetPhoto,
      targetPreset: presetPayload(targetPreset),
      targetPrompt,
    });
  } catch (error) {
    console.error("Preview generation failed:", error);
    return {
      image: null,
      warning: "이미지 생성에 실패했습니다. 텍스트 분석 결과만 확인해주세요.",
      verification: null,
    };
  }
};

export const analyzeHairCompatibility = async (
  currentPhoto: string,
  targetPhoto?: string | null,
  targetPreset?: HairStylePreset | null,
  targetPrompt?: string | null,
): Promise<HairAnalysis> => {
  return requestGemini<HairAnalysis>("analysis", {
    currentPhoto,
    targetPhoto,
    targetPreset: presetPayload(targetPreset),
    targetPrompt,
  });
};

export const findNearbySalons = async (
  location: GeoLocation,
  styleKeywords: string,
): Promise<Salon[]> => {
  try {
    const result = await requestGemini<{ salons: Salon[] }>("salons", {
      location,
      styleKeywords,
    });
    return result.salons.slice(0, 5);
  } catch (error) {
    console.error("Salon search failed", error);
    return [];
  }
};
