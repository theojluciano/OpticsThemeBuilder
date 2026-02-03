import type { OpticsStopName } from '../data/defaults';
import { makeColor, getContrast, getContrastLevel, type ContrastLevel } from './colors';

/**
 * Contrast statistics for a color palette
 */
export interface ContrastStats {
  aaa: number;
  aa: number;
  fail: number;
}

/**
 * Calculate contrast statistics for a set of color stops
 * Tests both 'on' and 'on-alt' colors against background
 */
export function calculateContrastStats(
  stops: OpticsStopName[],
  h: number,
  s: number,
  bgValues: Record<OpticsStopName, number>,
  onValues: Record<OpticsStopName, number>,
  onAltValues: Record<OpticsStopName, number>
): ContrastStats {
  return stops.reduce((acc, stop) => {
    const bgColor = makeColor(h, s, bgValues[stop]);
    const onColor = makeColor(h, s, onValues[stop]);
    const onAltColor = makeColor(h, s, onAltValues[stop]);
    
    const onContrast = getContrast(bgColor, onColor);
    const onAltContrast = getContrast(bgColor, onAltColor);
    
    const onLevel = getContrastLevel(onContrast);
    const onAltLevel = getContrastLevel(onAltContrast);
    
    // Increment counters based on contrast levels
    acc[onLevel]++;
    acc[onAltLevel]++;
    
    return acc;
  }, { aaa: 0, aa: 0, fail: 0 } as ContrastStats);
}