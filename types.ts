export interface HairAnalysis {
  growthAdvice: string;
  technique: 'perm' | 'dry' | 'cut' | 'color';
  techniqueDetails: string;
  stylistScript: string;
  styleKeywords: string;
  difficultyLevel: string;
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

export type TargetMode = 'preset' | 'custom';

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
  UPLOAD_TARGET = 1,
  ANALYZING = 2,
  RESULTS = 3,
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}
