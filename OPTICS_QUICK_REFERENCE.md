# Optics Format Quick Reference Card

## Generate Palette

```bash
# CLI
optics generate "#3b82f6" --name "primary" --optics

# JavaScript
import { generateOpticsPalette } from 'opticsthemebuilder';
const palette = generateOpticsPalette('#3b82f6', 'primary');
```

## Stop Names (19 total)

```
PLUS STOPS (lighter in light mode)
├─ plus-max     ← Lightest
├─ plus-eight
├─ plus-seven
├─ plus-six
├─ plus-five
├─ plus-four
├─ plus-three
├─ plus-two
└─ plus-one

BASE STOP
└─ base         ← Your input color

MINUS STOPS (darker in light mode)
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

## Three Colors Per Stop

```css
/* Background color */
--op-color-primary-base: light-dark(...);

/* Primary foreground (high contrast) */
--op-color-primary-on-base: light-dark(...);

/* Alternative foreground (medium contrast) */
--op-color-primary-on-base-alt: light-dark(...);
```

## CSS Usage

```css
/* Generated CSS uses light-dark() */
:root {
  color-scheme: light dark;
  
  --op-color-primary-h: 217;
  --op-color-primary-s: 91%;
  --op-color-primary-l: 60%;
  
  --op-color-primary-base: light-dark(
    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 40%),
    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 38%)
  );
}

/* Use in your styles */
.button {
  background: var(--op-color-primary-base);
  color: var(--op-color-primary-on-base);
}
```

## JavaScript Access

```javascript
const palette = generateOpticsPalette('#3b82f6', 'primary');

// Find a stop
const baseStop = palette.stops.find(s => s.name === 'base');

// Access colors
baseStop.background.light.hex  // "#0950c3"
baseStop.background.dark.hex   // "#094cb9"
baseStop.on.light.hex          // "#ffffff"
baseStop.on.dark.hex           // "#ffffff"

// Check contrast
baseStop.lightModeContrast.on  // 7.18
baseStop.darkModeContrast.on   // 7.73
```

## Export Formats

```javascript
import {
  exportOpticsToCSS,
  exportOpticsToJSON,
  exportOpticsToFigma,
  exportOpticsToTailwind,
  exportOpticsAll
} from 'opticsthemebuilder';

const css = exportOpticsToCSS(palette);
const json = exportOpticsToJSON(palette);
const figma = exportOpticsToFigma(palette);
const tailwind = exportOpticsToTailwind(palette);

// Save all formats
const files = exportOpticsAll(palette, './output');
```

## CLI Export Options

```bash
# Export all formats
optics generate "#3b82f6" --name "primary" --optics

# Export specific format
optics generate "#3b82f6" --name "primary" --optics --format css
optics generate "#3b82f6" --name "primary" --optics --format figma
optics generate "#3b82f6" --name "primary" --optics --format json
optics generate "#3b82f6" --name "primary" --optics --format tailwind
```

## Figma Import

1. Generate palette: `optics generate "#3b82f6" --name "primary" --optics`
2. Open Figma → Variables panel
3. Click "Import" button
4. Select `primary-optics-figma.json`
5. ✨ 57 variables imported with Light & Dark modes!

## Common Patterns

### Design System Colors
```bash
optics generate "#3b82f6" --name "primary" --optics
optics generate "#10b981" --name "success" --optics
optics generate "#ef4444" --name "danger" --optics
optics generate "#f59e0b" --name "warning" --optics
optics generate "#6b7280" --name "neutral" --optics
```

### Button Component
```css
.btn-primary {
  background: var(--op-color-primary-base);
  color: var(--op-color-primary-on-base);
}

.btn-primary:hover {
  background: var(--op-color-primary-minus-one);
}

.btn-primary:disabled {
  background: var(--op-color-primary-plus-three);
  color: var(--op-color-primary-on-plus-three-alt);
}
```

### Card Surfaces
```css
/* Light surface */
.card-light {
  background: var(--op-color-neutral-plus-max);
  color: var(--op-color-neutral-on-plus-max);
}

/* Dark surface */
.card-dark {
  background: var(--op-color-neutral-minus-max);
  color: var(--op-color-neutral-on-minus-max);
}

/* Base surface */
.card-base {
  background: var(--op-color-neutral-base);
  color: var(--op-color-neutral-on-base);
}
```

## Lightness Values

### Light Mode
```
100% → plus-max
 98% → plus-eight
 96% → plus-seven
 94% → plus-six
 90% → plus-five
 84% → plus-four
 70% → plus-three
 64% → plus-two
 45% → plus-one
 40% → base          ← Adjusted from input
 36% → minus-one
 32% → minus-two
 28% → minus-three
 24% → minus-four
 20% → minus-five
 16% → minus-six
  8% → minus-seven
  4% → minus-eight
  0% → minus-max
```

### Dark Mode
```
 12% → plus-max
 14% → plus-eight
 16% → plus-seven
 20% → plus-six
 24% → plus-five
 26% → plus-four
 29% → plus-three
 32% → plus-two
 35% → plus-one
 38% → base          ← Adjusted from input
 40% → minus-one
 45% → minus-two
 48% → minus-three
 52% → minus-four
 64% → minus-five
 72% → minus-six
 80% → minus-seven
 88% → minus-eight
100% → minus-max
```

## Browser Support

**light-dark() function:**
- Chrome 123+
- Safari 17.5+
- Firefox 120+

For older browsers, use Figma export with manual theme switching.

## Key Differences: Optics vs Standard

| Feature | Standard | Optics |
|---------|----------|--------|
| Stops | 16 | 19 |
| Naming | 0-15 | plus-max to minus-max |
| Light/Dark | Separate | Built-in |
| CSS | Variables | light-dark() |
| Figma | 1 mode | 2 modes |

## Resources

- Full Docs: [OPTICS_FORMAT.md](OPTICS_FORMAT.md)
- Examples: `node example-optics.js`
- Repository: [GitHub](https://github.com/yourusername/OpticsThemeBuilder)

---

**Pro Tip**: Start with your brand color at ~40-60% lightness for best results!