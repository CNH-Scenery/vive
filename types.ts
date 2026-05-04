export interface HairAnalysis {
  growthAdvice: string;
  technique: 'perm' | 'dry' | 'cut' | 'color';
  techniqueDetails: string;
  stylistScript: string;
  styleKeywords: string;
  difficultyLevel: string;
  currentLength?: 'short' | 'medium' | 'long' | 'extra_long' | 'unclear';
  currentTexture?: 'straight' | 'soft_wave' | 'strong_wave' | 'curl' | 'frizzy' | 'unclear';
}

export interface PreviewVerification {
  identityScore: number;
  styleScore: number;
  criticalIdentityChanged: boolean;
  changedNonHairRegion: boolean;
  styleGeneralizedInsteadOfCopied: boolean;
}

export interface PreviewResult {
  image: string | null;
  warning: string | null;
  verification: PreviewVerification | null;
}

export type TargetMode = 'preset' | 'custom' | 'text';

export interface HairStylePreset {
  id: string;
  name: string;
  category: string;
  tags: string[];
  thumbnail: string;
  styleKeywords: string;
  hairSpec: Record<string, unknown>;
}

export interface Salon {
  name: string;
  address: string;
  rating?: number;
  uri?: string;
  userRatingCount?: number;
}

export enum AppStep {
  UPLOAD_CURRENT = 0,
  ANALYZING_CURRENT = 1,
  CHOOSE_STYLE = 2,
  GENERATING = 3,
  RESULTS = 4,
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}
