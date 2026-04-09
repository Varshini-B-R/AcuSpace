export type StimulationMethodType =
  | 'needle'
  | 'seed'
  | 'magnet'
  | 'pressure'
  | 'light'
  | 'color';

export interface StimulationMethod {
  type: StimulationMethodType;
  description: string;
  safetyNote: string;
}

export interface TCMPoint {
  code: string;
  name: string;
  locationText: string;
  imageUrl?: string;
  benefits: string[];
  stimulation: StimulationMethod[];
  isLocked: boolean;
}

export type Element = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
export type YinYang = 'yin' | 'yang';

export interface Meridian {
  id: string;
  name: string;
  element: Element;
  yinYang: YinYang;
  description: string;
  peakTime: string;
  points: TCMPoint[];
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string;
  imageUrl: string;
  website?: string;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string;
  rating: number;
  experience: string; // e.g. "10 years"
  imageUrl: string;
  phone: string;
  email: string;
  website?: string;
}