import { writable } from 'svelte/store';
import type { OpticsStopName } from '../data/defaults';
import { 
  LIGHT_MODE_BG, 
  DARK_MODE_BG, 
  LIGHT_MODE_ON, 
  DARK_MODE_ON, 
  LIGHT_MODE_ON_ALT, 
  DARK_MODE_ON_ALT 
} from '../data/defaults';

export interface ColorTypeConfig {
  id: string;
  name: string;
  enabled: boolean;
  isCustom: boolean;
  collapsed: boolean;
  h: number;
  s: number;
  lightBg: Record<OpticsStopName, number>;
  darkBg: Record<OpticsStopName, number>;
  lightOn: Record<OpticsStopName, number>;
  darkOn: Record<OpticsStopName, number>;
  lightOnAlt: Record<OpticsStopName, number>;
  darkOnAlt: Record<OpticsStopName, number>;
}

export interface ColorTypesState {
  mode: 'light' | 'dark';
  colorTypes: ColorTypeConfig[];
}

function createDefaultColorType(
  id: string,
  name: string,
  h: number,
  s: number,
  isCustom: boolean = false
): ColorTypeConfig {
  return {
    id,
    name,
    enabled: true,
    isCustom,
    collapsed: false,
    h,
    s,
    lightBg: { ...LIGHT_MODE_BG },
    darkBg: { ...DARK_MODE_BG },
    lightOn: { ...LIGHT_MODE_ON },
    darkOn: { ...DARK_MODE_ON },
    lightOnAlt: { ...LIGHT_MODE_ON_ALT },
    darkOnAlt: { ...DARK_MODE_ON_ALT }
  };
}

const DEFAULT_COLOR_TYPES: ColorTypeConfig[] = [
  createDefaultColorType('primary', 'Primary', 217, 91),
  createDefaultColorType('neutral', 'Neutral', 217, 4),
  createDefaultColorType('secondary', 'Secondary', 260, 60),
  createDefaultColorType('notice', 'Notice', 142, 76),
  createDefaultColorType('warning', 'Warning', 38, 92),
  createDefaultColorType('danger', 'Danger', 0, 84),
  createDefaultColorType('info', 'Info', 199, 89),
];

function createColorTypesStore() {
  const { subscribe, set, update } = writable<ColorTypesState>({
    mode: 'light',
    colorTypes: DEFAULT_COLOR_TYPES
  });

  return {
    subscribe,
    setMode: (mode: 'light' | 'dark') => 
      update(state => ({ ...state, mode })),
    
    toggleColorType: (id: string) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct =>
          ct.id === id ? { ...ct, enabled: !ct.enabled } : ct
        )
      })),
    
    toggleCollapse: (id: string) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct =>
          ct.id === id ? { ...ct, collapsed: !ct.collapsed } : ct
        )
      })),
    
    updateHue: (id: string, h: number) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct =>
          ct.id === id ? { ...ct, h } : ct
        )
      })),
    
    updateSaturation: (id: string, s: number) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct =>
          ct.id === id ? { ...ct, s } : ct
        )
      })),
    
    updateBg: (id: string, stop: OpticsStopName, value: number) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct => {
          if (ct.id !== id) return ct;
          if (state.mode === 'light') {
            return { ...ct, lightBg: { ...ct.lightBg, [stop]: value } };
          } else {
            return { ...ct, darkBg: { ...ct.darkBg, [stop]: value } };
          }
        })
      })),
    
    updateOn: (id: string, stop: OpticsStopName, value: number) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct => {
          if (ct.id !== id) return ct;
          if (state.mode === 'light') {
            return { ...ct, lightOn: { ...ct.lightOn, [stop]: value } };
          } else {
            return { ...ct, darkOn: { ...ct.darkOn, [stop]: value } };
          }
        })
      })),
    
    updateOnAlt: (id: string, stop: OpticsStopName, value: number) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct => {
          if (ct.id !== id) return ct;
          if (state.mode === 'light') {
            return { ...ct, lightOnAlt: { ...ct.lightOnAlt, [stop]: value } };
          } else {
            return { ...ct, darkOnAlt: { ...ct.darkOnAlt, [stop]: value } };
          }
        })
      })),
    
    addCustomColorType: (name: string, h: number, s: number) =>
      update(state => {
        const id = `custom-${Date.now()}`;
        const newColorType = createDefaultColorType(id, name, h, s, true);
        return {
          ...state,
          colorTypes: [...state.colorTypes, newColorType]
        };
      }),
    
    removeColorType: (id: string) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.filter(ct => ct.id !== id)
      })),
    
    renameColorType: (id: string, name: string) =>
      update(state => ({
        ...state,
        colorTypes: state.colorTypes.map(ct =>
          ct.id === id ? { ...ct, name } : ct
        )
      })),
    
    reset: () => set({
      mode: 'light',
      colorTypes: DEFAULT_COLOR_TYPES
    })
  };
}

export const colorTypes = createColorTypesStore();