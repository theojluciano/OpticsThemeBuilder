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
    h?: number;
    s?: number;
    l: number;
    alpha?: number;
  }

  export interface Hsv {
    mode: 'hsv';
    h?: number;
    s?: number;
    v: number;
    alpha?: number;
  }

  export interface Lab {
    mode: 'lab';
    l: number;
    a: number;
    b: number;
    alpha?: number;
  }

  export type Color = Rgb | Hsl | Hsv | Lab;

  export function rgb(color: string | Color | any): Rgb | undefined;
  export function hsl(color: string | Color | any): Hsl | undefined;
  export function hsv(color: string | Color | any): Hsv | undefined;
  export function lab(color: string | Color | any): Lab | undefined;

  export function formatHex(color: Color | any): string;
  export function formatRgb(color: Color | any): string;
  export function formatHsl(color: Color | any): string;

  export function converter(mode: 'rgb'): (color: string | Color | any) => Rgb | undefined;
  export function converter(mode: 'hsl'): (color: string | Color | any) => Hsl | undefined;
  export function converter(mode: 'hsv'): (color: string | Color | any) => Hsv | undefined;
  export function converter(mode: 'lab'): (color: string | Color | any) => Lab | undefined;
  export function converter(mode: string): (color: string | Color | any) => Color | undefined;

  export function parse(color: string): Color | undefined;
  export function interpolate(colors: (string | Color)[], mode?: string): (t: number) => Color;
  export function samples(n: number): number[];
  export function clampRgb(color: Rgb): Rgb;
  export function clampChroma(color: Color, mode?: string): Color;
}