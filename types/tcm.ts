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
