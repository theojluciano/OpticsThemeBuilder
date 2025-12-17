export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface ColorStop {
  stop: number;
  background: {
    hsl: HSLColor;
    rgb: RGBColor;
    hex: string;
  };
  foregrounds: {
    light: {
      hsl: HSLColor;
      rgb: RGBColor;
      hex: string;
      contrast: number;
      wcagAA: boolean;
      wcagAAA: boolean;
    };
    dark: {
      hsl: HSLColor;
      rgb: RGBColor;
      hex: string;
      contrast: number;
      wcagAA: boolean;
      wcagAAA: boolean;
    };
  };
  recommendedForeground: 'light' | 'dark';
}

export interface ColorPalette {
  name: string;
  baseColor: {
    hsl: HSLColor;
    rgb: RGBColor;
    hex: string;
  };
  stops: ColorStop[];
  metadata: {
    generatedAt: string;
    totalStops: number;
  };
}

export interface FigmaVariable {
  name: string;
  type: 'COLOR';
  value: string;
}

export interface FigmaExport {
  collections: {
    name: string;
    modes: string[];
  }[];
  variables: FigmaVariable[];
}

// Optics Scale Types
export type OpticsStopName = 
  | 'plus-max'
  | 'plus-eight'
  | 'plus-seven'
  | 'plus-six'
  | 'plus-five'
  | 'plus-four'
  | 'plus-three'
  | 'plus-two'
  | 'plus-one'
  | 'base'
  | 'minus-one'
  | 'minus-two'
  | 'minus-three'
  | 'minus-four'
  | 'minus-five'
  | 'minus-six'
  | 'minus-seven'
  | 'minus-eight'
  | 'minus-max';

export interface OpticsColorValue {
  light: {
    hsl: HSLColor;
    rgb: RGBColor;
    hex: string;
  };
  dark: {
    hsl: HSLColor;
    rgb: RGBColor;
    hex: string;
  };
}

export interface OpticsColorStop {
  name: OpticsStopName;
  background: OpticsColorValue;
  on: OpticsColorValue;
  onAlt: OpticsColorValue;
  // Contrast information
  lightModeContrast: {
    on: number;
    onAlt: number;
  };
  darkModeContrast: {
    on: number;
    onAlt: number;
  };
}

export interface OpticsPalette {
  name: string;
  baseColor: {
    h: number;
    s: number;
    l: number;
    hsl: HSLColor;
    rgb: RGBColor;
    hex: string;
  };
  stops: OpticsColorStop[];
  metadata: {
    generatedAt: string;
    totalStops: number;
    format: 'optics';
  };
}