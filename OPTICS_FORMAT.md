# Optics Color Scale Format

Generate color palettes using the **Optics scale format** - a semantic, theme-aware color system inspired by photography f-stops.

## Overview

The Optics format provides:

- **19 semantic stops** with meaningful names (not just numbers)
- **Built-in light/dark mode** support with separate values for each theme
- **Three colors per stop**: background, "on" (primary foreground), and "on-alt" (alternative foreground)
- **Automatic theme switching** using CSS `light-dark()` function
- **Photography-inspired naming** based on aperture f-stops
- **WCAG contrast analysis** for both light and dark modes

## Quick Start

### CLI Usage

```bash
# Generate an Optics palette
optics generate "#3b82f6" --name "primary" --optics

# Generate multiple semantic colors
optics generate "#3b82f6" --name "primary" --optics
optics generate "#10b981" --name "success" --optics
optics generate "#ef4444" --name "danger" --optics
optics generate "#6b7280" --name "neutral" --optics
```

### Programmatic Usage

```javascript
import { generateOpticsPalette, exportOpticsToCSS } from 'opticsthemebuilder';

// Generate palette
const palette = generateOpticsPalette('#3b82f6', 'primary');

// Export to CSS with light-dark() support
const css = exportOpticsToCSS(palette);

// Access individual stops
const baseStop = palette.stops.find(s => s.name === 'base');
console.log(baseStop.background.light.hex);  // Light mode color
console.log(baseStop.background.dark.hex);   // Dark mode color
```

## The Optics Scale

### Stop Naming Convention

The Optics scale uses **19 stops** named using photography f-stop terminology:

```
PLUS STOPS (lighter in light mode, darker in dark mode):
├─ plus-max     ← Lightest
├─ plus-eight
├─ plus-seven
├─ plus-six
├─ plus-five
├─ plus-four
├─ plus-three
├─ plus-two
└─ plus-one

BASE STOP (the base color):
└─ base         ← Your input color

MINUS STOPS (darker in light mode, lighter in dark mode):
├─ minus-one
├─ minus-two
├─ minus-three
├─ minus-four
├─ minus-five
├─ minus-six
├─ minus-seven
├─ minus-eight
└─ minus-max    ← Darkest
```

### Why F-Stops?

In photography, f-stops control light exposure. The Optics scale borrows this concept:

- **PLUS** stops → Add luminosity (more light)
- **MINUS** stops → Remove luminosity (less light)
- **Numbers** indicate the magnitude of change

This creates an intuitive, semantic naming system that designers and developers can understand.

## Color Structure

Each stop provides **three colors**:

### 1. Background Color
The main color for backgrounds, surfaces, and UI elements.

```css
--op-color-primary-base: light-dark(
  hsl(217 91% 40%),  /* Light mode */
  hsl(217 91% 38%)   /* Dark mode */
);
```

### 2. "On" Color (Primary Foreground)
The primary foreground color for text and icons on the background. Optimized for maximum contrast.

```css
--op-color-primary-on-base: light-dark(
  hsl(217 91% 100%),  /* Light mode - white text on dark bg */
  hsl(217 91% 100%)   /* Dark mode - white text on dark bg */
);
```

### 3. "On-Alt" Color (Alternative Foreground)
An alternative foreground color for secondary text, icons, or lower-emphasis content.

```css
--op-color-primary-on-base-alt: light-dark(
  hsl(217 91% 88%),   /* Light mode - slightly darker */
  hsl(217 91% 84%)    /* Dark mode - slightly darker */
);
```

## Export Formats

### 1. CSS with `light-dark()`

The CSS export uses the modern `light-dark()` function for automatic theme switching:

```css
:root {
  color-scheme: light dark;
  
  /* Base color variables */
  --op-color-primary-h: 217;
  --op-color-primary-s: 91%;
  --op-color-primary-l: 60%;
  
  /* Main scale */
  --op-color-primary-base: light-dark(
    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 40%),
    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 38%)
  );
  
  /* On scale */
  --op-color-primary-on-base: light-dark(
    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 100%),
    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 100%)
  );
  
  /* On-alt scale */
  --op-color-primary-on-base-alt: light-dark(
    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 88%),
    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 84%)
  );
}
```

**Browser Support**: The `light-dark()` function is supported in Chrome 123+, Safari 17.5+, Firefox 120+.

### 2. Figma Variables

Import into Figma with full light/dark mode support:

1. Generate the palette: `optics generate "#3b82f6" --name "primary" --optics`
2. Open Figma → Variables panel (right sidebar)
3. Click "Import" button
4. Select `primary-optics-figma.json`
5. Your palette is imported with Light and Dark modes!

The Figma export creates **57 variables** per palette:
- 19 background colors
- 19 "on" colors
- 19 "on-alt" colors

All variables support both Light and Dark modes in Figma.

### 3. Design Tokens (W3C Format)

Standard Design Tokens format for interoperability:

```json
{
  "primary": {
    "$type": "color",
    "$description": "primary color scale with light and dark mode support",
    "base": {
      "h": { "$value": 217 },
      "s": { "$value": 91 },
      "l": { "$value": 60 }
    },
    "plus-max": {
      "background": {
        "light": { "$value": "#ffffff" },
        "dark": { "$value": "#03183b" }
      },
      "on": {
        "light": { "$value": "#000000" },
        "dark": { "$value": "#ffffff" }
      },
      "onAlt": {
        "light": { "$value": "#072c7a" },
        "dark": { "$value": "#bacbf2" }
      }
    }
  }
}
```

### 4. Tailwind Config

Use in your Tailwind configuration:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': {
          'plus-max': {
            DEFAULT: '#ffffff',      // Light mode
            dark: '#03183b',         // Dark mode
            on: {
              DEFAULT: '#000000',
              dark: '#ffffff',
            },
            'on-alt': {
              DEFAULT: '#072c7a',
              dark: '#bacbf2',
            },
          },
          'base': {
            DEFAULT: '#0950c3',
            dark: '#094cb9',
            on: {
              DEFAULT: '#ffffff',
              dark: '#ffffff',
            },
            'on-alt': {
              DEFAULT: '#bfd7f8',
              dark: '#afcef6',
            },
          },
          // ... more stops
        }
      }
    }
  }
}
```

### 5. JSON (Full Data)

Complete palette data with all color information:

```json
{
  "name": "primary",
  "baseColor": {
    "h": 217,
    "s": 91,
    "l": 60,
    "hsl": { "h": 217, "s": 0.91, "l": 0.6 },
    "rgb": { "r": 0.231, "g": 0.510, "b": 0.965 },
    "hex": "#3b82f6"
  },
  "stops": [
    {
      "name": "base",
      "background": {
        "light": { "hsl": {...}, "rgb": {...}, "hex": "#0950c3" },
        "dark": { "hsl": {...}, "rgb": {...}, "hex": "#094cb9" }
      },
      "on": {
        "light": { "hsl": {...}, "rgb": {...}, "hex": "#ffffff" },
        "dark": { "hsl": {...}, "rgb": {...}, "hex": "#ffffff" }
      },
      "onAlt": {
        "light": { "hsl": {...}, "rgb": {...}, "hex": "#bfd7f8" },
        "dark": { "hsl": {...}, "rgb": {...}, "hex": "#afcef6" }
      },
      "lightModeContrast": {
        "on": 7.18,
        "onAlt": 5.01
      },
      "darkModeContrast": {
        "on": 7.73,
        "onAlt": 4.78
      }
    }
  ],
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "totalStops": 19,
    "format": "optics"
  }
}
```

## Usage Examples

### Example 1: Complete Design System

Generate all semantic colors for your design system:

```bash
# Brand colors
optics generate "#3b82f6" --name "primary" --optics
optics generate "#8b5cf6" --name "secondary" --optics

# Semantic colors
optics generate "#10b981" --name "success" --optics
optics generate "#f59e0b" --name "warning" --optics
optics generate "#ef4444" --name "danger" --optics
optics generate "#3b82f6" --name "info" --optics

# Neutral colors
optics generate "#6b7280" --name "neutral" --optics
```

### Example 2: Using in CSS

```css
/* Import your generated CSS */
@import './primary-optics.css';

/* Use the colors */
.button-primary {
  background: var(--op-color-primary-base);
  color: var(--op-color-primary-on-base);
}

.button-primary:hover {
  background: var(--op-color-primary-minus-one);
}

.text-secondary {
  color: var(--op-color-primary-on-base-alt);
}

/* Light surfaces */
.card {
  background: var(--op-color-neutral-plus-max);
  color: var(--op-color-neutral-on-plus-max);
}

/* Dark surfaces */
.sidebar {
  background: var(--op-color-neutral-minus-max);
  color: var(--op-color-neutral-on-minus-max);
}
```

### Example 3: Programmatic Access

```javascript
import { generateOpticsPalette } from 'opticsthemebuilder';

const palette = generateOpticsPalette('#3b82f6', 'primary');

// Find a specific stop
const baseStop = palette.stops.find(s => s.name === 'base');

// Get colors for light mode
const lightBg = baseStop.background.light.hex;
const lightFg = baseStop.on.light.hex;
const lightContrast = baseStop.lightModeContrast.on;

console.log(`Light mode: ${lightBg} + ${lightFg} = ${lightContrast.toFixed(2)}:1`);

// Get colors for dark mode
const darkBg = baseStop.background.dark.hex;
const darkFg = baseStop.on.dark.hex;
const darkContrast = baseStop.darkModeContrast.on;

console.log(`Dark mode: ${darkBg} + ${darkFg} = ${darkContrast.toFixed(2)}:1`);

// Iterate through all stops
palette.stops.forEach(stop => {
  console.log(`${stop.name}:`);
  console.log(`  Light: ${stop.background.light.hex}`);
  console.log(`  Dark: ${stop.background.dark.hex}`);
});
```

### Example 4: React Component

```jsx
import { generateOpticsPalette } from 'opticsthemebuilder';

function ThemeButton({ colorName = 'primary' }) {
  const palette = generateOpticsPalette('#3b82f6', colorName);
  const baseStop = palette.stops.find(s => s.name === 'base');
  
  return (
    <button
      style={{
        '--bg-light': baseStop.background.light.hex,
        '--bg-dark': baseStop.background.dark.hex,
        '--fg-light': baseStop.on.light.hex,
        '--fg-dark': baseStop.on.dark.hex,
        background: 'light-dark(var(--bg-light), var(--bg-dark))',
        color: 'light-dark(var(--fg-light), var(--fg-dark))',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '0.25rem',
      }}
    >
      Themed Button
    </button>
  );
}
```

## Accessibility & Contrast

### Automatic Contrast Checking

Every Optics palette includes contrast analysis for both light and dark modes:

```javascript
const palette = generateOpticsPalette('#3b82f6', 'primary');

palette.stops.forEach(stop => {
  const { lightModeContrast, darkModeContrast } = stop;
  
  console.log(`${stop.name}:`);
  console.log(`  Light: on=${lightModeContrast.on.toFixed(2)}, alt=${lightModeContrast.onAlt.toFixed(2)}`);
  console.log(`  Dark: on=${darkModeContrast.on.toFixed(2)}, alt=${darkModeContrast.onAlt.toFixed(2)}`);
});
```

### WCAG Compliance

Contrast ratios are calculated per WCAG 2.0 guidelines:

- **WCAG AA**: Minimum 4.5:1 for normal text, 3:1 for large text
- **WCAG AAA**: Minimum 7:1 for normal text, 4.5:1 for large text

The "on" colors are optimized for maximum contrast, while "on-alt" provides medium contrast for secondary content.

## Lightness Values Reference

### Light Mode Lightness Values

```
plus-max:    100%  (pure white)
plus-eight:   98%
plus-seven:   96%
plus-six:     94%
plus-five:    90%
plus-four:    84%
plus-three:   70%
plus-two:     64%
plus-one:     45%
base:         40%  ← Your base color adjusted
minus-one:    36%
minus-two:    32%
minus-three:  28%
minus-four:   24%
minus-five:   20%
minus-six:    16%
minus-seven:   8%
minus-eight:   4%
minus-max:     0%  (pure black)
```

### Dark Mode Lightness Values

```
plus-max:     12%  (darkest surface)
plus-eight:   14%
plus-seven:   16%
plus-six:     20%
plus-five:    24%
plus-four:    26%
plus-three:   29%
plus-two:     32%
plus-one:     35%
base:         38%  ← Your base color adjusted
minus-one:    40%
minus-two:    45%
minus-three:  48%
minus-four:   52%
minus-five:   64%
minus-six:    72%
minus-seven:  80%
minus-eight:  88%
minus-max:   100%  (lightest surface)
```

**Note**: The scale inverts between light and dark modes - "plus" stops are light in light mode but dark in dark mode, and vice versa.

## API Reference

### `generateOpticsPalette(color, name)`

Generate an Optics color palette.

**Parameters:**
- `color` (string | HSLColor): Base color (hex, rgb, hsl, or named color)
- `name` (string): Name for the palette (e.g., "primary", "success")

**Returns:** `OpticsPalette` object

**Example:**
```javascript
const palette = generateOpticsPalette('#3b82f6', 'primary');
```

### `exportOpticsToCSS(palette)`

Export palette to CSS with `light-dark()` function.

**Returns:** CSS string

### `exportOpticsToJSON(palette)`

Export complete palette data to JSON.

**Returns:** JSON string

### `exportOpticsToFigma(palette)`

Export to Figma Variables format with Light/Dark modes.

**Returns:** JSON string (Figma Variables API format)

### `exportOpticsToTailwind(palette)`

Export to Tailwind configuration format.

**Returns:** JavaScript string

### `exportOpticsToDesignTokens(palette)`

Export to W3C Design Tokens format.

**Returns:** JSON string

### `exportOpticsAll(palette, outputDir)`

Export all formats to files.

**Parameters:**
- `palette` (OpticsPalette): The palette to export
- `outputDir` (string): Directory to save files (default: './output')

**Returns:** Array of file paths created

## TypeScript Support

Full TypeScript definitions included:

```typescript
import {
  OpticsPalette,
  OpticsColorStop,
  OpticsStopName,
  OpticsColorValue
} from 'opticsthemebuilder';

const palette: OpticsPalette = generateOpticsPalette('#3b82f6', 'primary');
const stop: OpticsColorStop = palette.stops[0];
const stopName: OpticsStopName = 'base';
const colorValue: OpticsColorValue = stop.background;
```

## Comparison: Optics vs Standard Format

| Feature | Standard Format | Optics Format |
|---------|----------------|---------------|
| Stops | 16 (customizable) | 19 (fixed) |
| Naming | Numeric (0-15) | Semantic (plus-max to minus-max) |
| Light/Dark | Separate palettes | Built-in with `light-dark()` |
| Foregrounds | 2 per stop (light/dark) | 2 per stop per mode (on/on-alt) |
| CSS Output | Simple variables | `light-dark()` function |
| Figma | Single mode | Dual modes (Light/Dark) |
| Use Case | Simple palettes | Full design systems |

## FAQs

### Can I use both formats?

Yes! The Optics format is an addition, not a replacement. Use `--optics` flag for Optics format, or omit it for the standard format.

### Which format should I use?

- **Standard format**: Quick color scales, simple projects, single theme
- **Optics format**: Design systems, dual themes, semantic naming, production apps

### Does `light-dark()` work everywhere?

The `light-dark()` CSS function requires modern browsers (Chrome 123+, Safari 17.5+, Firefox 120+). For older browsers, use the Figma format with manual theme switching or generate separate CSS files.

### How do I customize the lightness values?

The Optics format uses predefined lightness values based on the Optics design system. For custom values, use the standard format with the `--stops` option.

### Can I generate custom stop names?

The Optics format uses fixed semantic names. For custom naming, use the standard format and rename variables in your export.

## Resources

- [Optics Design System](https://optics.dev)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [CSS light-dark() function](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [Photography F-Stops](https://www.adobe.com/creativecloud/photography/discover/f-stop.html)

## Examples

See `example-optics.js` for comprehensive examples of generating and using Optics palettes.

---

**Built with ❤️ for designers and developers who need professional, accessible color systems with full theme support.**