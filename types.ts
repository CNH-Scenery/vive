export interface HairAnalysis {
  growthAdvice: string;
  technique: 'perm' | 'dry' | 'cut' | 'color';
  techniqueDetails: string;
  stylistScript: string;
  styleKeywords: string;
  difficultyLevel: string;
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