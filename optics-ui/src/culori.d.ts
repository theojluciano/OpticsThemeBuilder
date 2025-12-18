declare module 'culori' {
  export interface Rgb {
    mode: 'rgb';
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }

  export interface Hsl {
    mode: 'hsl';
    h: number;
    s: number;
    l: number;
    alpha?: number;
  }

  export type Color = Rgb | Hsl | string | { h: number; s: number; l: number } | { r: number; g: number; b: number };

  export function rgb(color: Color): Rgb | undefined;
  export function hsl(color: Color): Hsl | undefined;
  export function parse(color: string): Rgb | Hsl | undefined;
  export function formatHex(color: Color | undefined): string;
  export function converter(mode: 'rgb'): (color: Color) => Rgb | undefined;
  export function converter(mode: 'hsl'): (color: Color) => Hsl | undefined;
}