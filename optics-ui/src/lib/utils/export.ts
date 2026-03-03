import { parse, converter, formatHex } from 'culori';
import type { OpticsStopName } from '../data/defaults';
import { OPTICS_STOPS } from '../data/defaults';

export interface PaletteData {
  name: string;
  h: number;
  s: number;
  mode: 'light' | 'dark';
  stops: Record<OpticsStopName, {
    bg: number;
    on: number;
    onAlt: number;
  }>;
}

const toRgb = converter('rgb');

function createColorToken(h: number, s: number, l: number) {
  const rgb = toRgb({ mode: 'hsl', h, s: s / 100, l: l / 100 })!;
  return {
    $type: 'color',
    $value: {
      colorSpace: 'srgb',
      components: [rgb.r, rgb.g, rgb.b],
      alpha: 1.0,
      hex: formatHex(rgb)
    }
  };
}

/**
 * Parse an OpticsStopName into its group prefix and JSON key.
 * e.g. 'plus-max' → { group: 'plus', key: 'max' }
 *      'base'     → { group: 'base', key: 'base' }
 */
export function parseStopName(stop: OpticsStopName): { group: 'base' | 'plus' | 'minus'; key: string } {
  if (stop === 'base') return { group: 'base', key: 'base' };
  const dashIndex = stop.indexOf('-');
  return {
    group: stop.slice(0, dashIndex) as 'plus' | 'minus',
    key: stop.slice(dashIndex + 1)
  };
}

export function exportFigmaJSON(palettes: PaletteData[]): string {
  if (palettes.length === 0) {
    return '{}';
  }

  const mode = palettes[0].mode;
  const figmaData: Record<string, any> = {
    $extensions: {
      'com.figma.modeName': mode === 'light' ? 'Light' : 'Dark'
    }
  };

  palettes.forEach(data => {
    const entry: Record<string, any> = {
      base: null,
      plus: {},
      minus: {},
      on: { base: null, 'base-alt': null, plus: {}, minus: {} }
    };

    OPTICS_STOPS.forEach(stop => {
      const values = data.stops[stop];
      const bgToken = createColorToken(data.h, data.s, values.bg);
      const onToken = createColorToken(data.h, data.s, values.on);
      const onAltToken = createColorToken(data.h, data.s, values.onAlt);

      const { group, key } = parseStopName(stop);

      if (group === 'base') {
        entry.base = bgToken;
        entry.on.base = onToken;
        entry.on['base-alt'] = onAltToken;
      } else {
        entry[group][key] = bgToken;
        entry.on[group][key] = onToken;
        entry.on[group][key + '-alt'] = onAltToken;
      }
    });

    figmaData[data.name] = entry;
  });

  return JSON.stringify(figmaData, null, 2);
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
