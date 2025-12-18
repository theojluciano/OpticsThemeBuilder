import { writable, derived } from 'svelte/store';
import type { OpticsStopName } from '../data/defaults';
import { OPTICS_STOPS, LIGHT_MODE_BG, DARK_MODE_BG, LIGHT_MODE_ON, DARK_MODE_ON, LIGHT_MODE_ON_ALT, DARK_MODE_ON_ALT } from '../data/defaults';

export interface PaletteState {
  name: string;
  baseColor: string;
  h: number;
  s: number;
  mode: 'light' | 'dark';
  lightBg: Record<OpticsStopName, number>;
  darkBg: Record<OpticsStopName, number>;
  lightOn: Record<OpticsStopName, number>;
  darkOn: Record<OpticsStopName, number>;
  lightOnAlt: Record<OpticsStopName, number>;
  darkOnAlt: Record<OpticsStopName, number>;
}

function createPaletteStore() {
  const { subscribe, set, update } = writable<PaletteState>({
    name: 'primary',
    baseColor: '#3b82f6',
    h: 217,
    s: 91,
    mode: 'light',
    lightBg: { ...LIGHT_MODE_BG },
    darkBg: { ...DARK_MODE_BG },
    lightOn: { ...LIGHT_MODE_ON },
    darkOn: { ...DARK_MODE_ON },
    lightOnAlt: { ...LIGHT_MODE_ON_ALT },
    darkOnAlt: { ...DARK_MODE_ON_ALT }
  });

  return {
    subscribe,
    setName: (name: string) => update(state => ({ ...state, name })),
    setBaseColor: (baseColor: string, h: number, s: number) => 
      update(state => ({ ...state, baseColor, h, s })),
    setMode: (mode: 'light' | 'dark') => 
      update(state => ({ ...state, mode })),
    updateBg: (stop: OpticsStopName, value: number) =>
      update(state => {
        if (state.mode === 'light') {
          return { ...state, lightBg: { ...state.lightBg, [stop]: value } };
        } else {
          return { ...state, darkBg: { ...state.darkBg, [stop]: value } };
        }
      }),
    updateOn: (stop: OpticsStopName, value: number) =>
      update(state => {
        if (state.mode === 'light') {
          return { ...state, lightOn: { ...state.lightOn, [stop]: value } };
        } else {
          return { ...state, darkOn: { ...state.darkOn, [stop]: value } };
        }
      }),
    updateOnAlt: (stop: OpticsStopName, value: number) =>
      update(state => {
        if (state.mode === 'light') {
          return { ...state, lightOnAlt: { ...state.lightOnAlt, [stop]: value } };
        } else {
          return { ...state, darkOnAlt: { ...state.darkOnAlt, [stop]: value } };
        }
      }),
    reset: () => set({
      name: 'primary',
      baseColor: '#3b82f6',
      h: 217,
      s: 91,
      mode: 'light',
      lightBg: { ...LIGHT_MODE_BG },
      darkBg: { ...DARK_MODE_BG },
      lightOn: { ...LIGHT_MODE_ON },
      darkOn: { ...DARK_MODE_ON },
      lightOnAlt: { ...LIGHT_MODE_ON_ALT },
      darkOnAlt: { ...DARK_MODE_ON_ALT }
    })
  };
}

export const palette = createPaletteStore();
