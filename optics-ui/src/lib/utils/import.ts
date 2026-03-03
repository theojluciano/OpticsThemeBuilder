import { parse, converter } from 'culori';
import type { OpticsStopName } from '../data/defaults';
import { OPTICS_STOPS } from '../data/defaults';
import { parseStopName } from './export';

const toHsl = converter('hsl');

export interface ImportedColorType {
  name: string;
  h: number;
  s: number;
  bgValues: Record<OpticsStopName, number>;
  onValues: Record<OpticsStopName, number>;
  onAltValues: Record<OpticsStopName, number>;
}

export interface ImportResult {
  mode: 'light' | 'dark';
  colorTypes: ImportedColorType[];
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const color = parse(hex);
  if (!color) throw new Error(`Cannot parse color: ${hex}`);
  const hsl = toHsl(color);
  if (!hsl) throw new Error(`Cannot convert to HSL: ${hex}`);
  return {
    h: Math.round(hsl.h ?? 0),
    s: Math.round((hsl.s ?? 0) * 100),
    l: Math.round((hsl.l ?? 0) * 100)
  };
}

function isColorToken(obj: unknown): boolean {
  return !!obj && typeof obj === 'object' && '$value' in obj &&
    typeof (obj as Record<string, any>).$value?.hex === 'string';
}

function validateColorEntry(entry: unknown, name: string): asserts entry is Record<string, any> {
  if (!entry || typeof entry !== 'object') {
    throw new Error(`"${name}" is not a valid color type object`);
  }
  const e = entry as Record<string, any>;
  if (!e.base || !e.plus || !e.minus || !e.on) {
    throw new Error(`"${name}" doesn't match the expected Optics export format. Make sure you're importing a file exported from this tool.`);
  }
  if (!isColorToken(e.base)) {
    throw new Error(`"${name}" doesn't match the expected Optics export format. The base color entry is missing or malformed.`);
  }
  if (!e.on.base || !e.on['base-alt'] || !e.on.plus || !e.on.minus) {
    throw new Error(`"${name}" doesn't match the expected Optics export format. The "on" foreground colors are missing or incomplete.`);
  }
}

function extractL(token: Record<string, any>): number {
  return hexToHsl(token.$value.hex).l;
}

function extractStopValues(entry: Record<string, any>): {
  bgValues: Record<OpticsStopName, number>;
  onValues: Record<OpticsStopName, number>;
  onAltValues: Record<OpticsStopName, number>;
} {
  const bg = {} as Record<OpticsStopName, number>;
  const on = {} as Record<OpticsStopName, number>;
  const onAlt = {} as Record<OpticsStopName, number>;

  for (const stop of OPTICS_STOPS) {
    const { group, key } = parseStopName(stop);

    if (group === 'base') {
      bg[stop] = extractL(entry.base);
      on[stop] = extractL(entry.on.base);
      onAlt[stop] = extractL(entry.on['base-alt']);
    } else {
      bg[stop] = extractL(entry[group][key]);
      on[stop] = extractL(entry.on[group][key]);
      onAlt[stop] = extractL(entry.on[group][`${key}-alt`]);
    }
  }

  return { bgValues: bg, onValues: on, onAltValues: onAlt };
}

export function parseImportJSON(jsonString: string): ImportResult {
  let data: Record<string, any>;
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON: could not parse file');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid file: expected a JSON object');
  }

  const modeName = data.$extensions?.['com.figma.modeName'];
  if (modeName !== 'Light' && modeName !== 'Dark') {
    throw new Error('Not a valid Optics tokens file: missing or unknown mode');
  }
  const mode: 'light' | 'dark' = modeName === 'Light' ? 'light' : 'dark';

  const colorTypeNames = Object.keys(data).filter(k => k !== '$extensions');
  if (colorTypeNames.length === 0) {
    throw new Error('No color types found in file');
  }

  const colorTypes: ImportedColorType[] = colorTypeNames.map(name => {
    const entry = data[name];
    validateColorEntry(entry, name);

    try {
      const baseHsl = hexToHsl(entry.base.$value.hex);
      const { bgValues, onValues, onAltValues } = extractStopValues(entry);

      return { name, h: baseHsl.h, s: baseHsl.s, bgValues, onValues, onAltValues };
    } catch (err) {
      if (err instanceof Error && err.message.includes('doesn\'t match')) throw err;
      throw new Error(`"${name}" has missing or malformed color stops. Make sure you're importing a file exported from this tool.`);
    }
  });

  return { mode, colorTypes };
}
