import * as culori from 'culori';
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

export function exportFigmaJSON(palettes: PaletteData[]): string {
  if (palettes.length === 0) {
    return '{}';
  }

  const mode = palettes[0].mode;
  const figmaData: any = {
    $extensions: {
      'com.figma.modeName': mode === 'light' ? 'Light' : 'Dark'
    }
  };

  palettes.forEach(data => {
    figmaData[data.name] = {
      base: null,
      plus: {},
      minus: {},
      on: {
        base: null,
        'base-alt': null,
        plus: {},
        minus: {}
      }
    };

    OPTICS_STOPS.forEach(stop => {
      const values = data.stops[stop];
      const bgHex = culori.formatHex(culori.hsl({ h: data.h, s: data.s / 100, l: values.bg / 100 }));
      const onHex = culori.formatHex(culori.hsl({ h: data.h, s: data.s / 100, l: values.on / 100 }));
      const onAltHex = culori.formatHex(culori.hsl({ h: data.h, s: data.s / 100, l: values.onAlt / 100 }));
      
      const bgRgb = culori.rgb(bgHex)!;
      const onRgb = culori.rgb(onHex)!;
      const onAltRgb = culori.rgb(onAltHex)!;
      
      const bgVar = {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [bgRgb.r, bgRgb.g, bgRgb.b],
          alpha: 1.0,
          hex: bgHex
        }
      };
      
      const onVar = {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [onRgb.r, onRgb.g, onRgb.b],
          alpha: 1.0,
          hex: onHex
        }
      };
      
      const onAltVar = {
        $type: 'color',
        $value: {
          colorSpace: 'srgb',
          components: [onAltRgb.r, onAltRgb.g, onAltRgb.b],
          alpha: 1.0,
          hex: onAltHex
        }
      };
      
      if (stop === 'base') {
        figmaData[data.name].base = bgVar;
        figmaData[data.name].on.base = onVar;
        figmaData[data.name].on['base-alt'] = onAltVar;
      } else if (stop.startsWith('plus-')) {
        const key = stop.replace('plus-', '');
        figmaData[data.name].plus[key] = bgVar;
        figmaData[data.name].on.plus[key] = onVar;
        figmaData[data.name].on.plus[key + '-alt'] = onAltVar;
      } else if (stop.startsWith('minus-')) {
        const key = stop.replace('minus-', '');
        figmaData[data.name].minus[key] = bgVar;
        figmaData[data.name].on.minus[key] = onVar;
        figmaData[data.name].on.minus[key + '-alt'] = onAltVar;
      }
    });
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
