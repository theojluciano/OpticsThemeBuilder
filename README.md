# OpticsThemeBuilder 🎨

Generate accessible color palettes with automatic foreground color selection and WCAG contrast checking.

## Features

- 🎯 **Smart Color Scaling**: Generates 16 perceptually-distributed color stops from any base color
- 🌓 **Optics Scale Format**: 19 semantic stops with light/dark mode support (`plus-max` to `minus-max`)
- ♿ **WCAG Compliant**: Automatically calculates and validates contrast ratios (AA & AAA)
- 🎨 **HSL-Based**: Uses HSL color space for intuitive, predictable color manipulation
- 🔄 **Dual Foregrounds**: Provides light and dark foreground options for each background
- 📦 **Multiple Export Formats**: Figma Variables, JSON, CSS Custom Properties, and Tailwind
- 🚀 **CLI & Library**: Use as a command-line tool or import into your Node.js project

## Installation

```bash
npm install -g opticsthemebuilder
```

Or use locally in a project:

```bash
npm install opticsthemebuilder
```

## Quick Start

### CLI Usage

Generate a complete color palette from a single color:

```bash
# Standard format (16 stops)
optics generate "#3b82f6" --name "blue"

# Optics format (19 stops with light/dark mode)
optics generate "#3b82f6" --name "blue" --optics
```

This creates:
- `blue-light.tokens.json` / `blue-dark.tokens.json` - Figma Variables format (separate files for each mode)
- `blue.json` - Complete palette data
- `blue.css` - CSS Custom Properties
- `blue-tailwind.js` - Tailwind configuration

**New: Optics Format** - Use `--optics` flag for semantic naming (`plus-max`, `base`, `minus-max`) with built-in light/dark mode support. See [OPTICS_FORMAT.md](OPTICS_FORMAT.md) for details.

### Advanced CLI Options

```bash
# Standard format with custom options
optics generate "#3b82f6" \
  --name "primary" \
  --stops 16 \
  --output ./themes \
  --format figma

# Optics format
optics generate "#3b82f6" \
  --name "primary" \
  --optics \
  --output ./themes \
  --format all

# Generate Figma Variables for specific mode
optics generate "#3b82f6" \
  --name "primary" \
  --format figma \
  --mode light

# Generate both Light and Dark modes (default)
optics generate "#3b82f6" \
  --name "primary" \
  --format figma \
  --mode both
```

**Options:**
- `--name, -n`: Name for the palette (default: "palette")
- `--stops, -s`: Number of color stops (default: 16, range: 2-100, ignored with --optics)
- `--output, -o`: Output directory (default: "./output")
- `--format, -f`: Export format - `all`, `figma`, `json`, `css`, or `tailwind` (default: "all")
- `--mode, -m`: Mode for Figma export - `light`, `dark`, or `both` (default: "both")
- `--optics`: Generate using Optics scale format (19 stops with light-dark mode)

### Analyze Contrast

Check contrast between two colors:

```bash
optics analyze "#3b82f6" "#ffffff"
```

Output:
```
🔍 Contrast Analysis

   Background: #3b82f6
   Foreground: #ffffff
   Contrast Ratio: 4.54:1

   WCAG AA (4.5:1):  ✅ Pass
   WCAG AAA (7:1):   ❌ Fail
```

## Library Usage

### Generate a Palette

```javascript
import { generatePalette, exportToFigma, saveToFile } from 'opticsthemebuilder';

// Generate from hex color
const palette = generatePalette('#3b82f6', 'blue', 16);

console.log(palette.baseColor.hex); // "#3b82f6"
console.log(palette.stops.length);  // 16

// Each stop contains:
palette.stops.forEach(stop => {
  console.log({
    index: stop.stop,
    background: stop.background.hex,
    lightForeground: stop.foregrounds.light.hex,
    darkForeground: stop.foregrounds.dark.hex,
    recommended: stop.recommendedForeground,
    lightContrast: stop.foregrounds.light.contrast,
    darkContrast: stop.foregrounds.dark.contrast,
    wcagAA: stop.foregrounds.light.wcagAA
  });
});
```

### Export to Different Formats

```javascript
import { 
  generatePalette, 
  exportToFigma, 
  exportToJSON,
  exportToCSS,
  exportToTailwind,
  exportToDesignTokens,
  exportAll 
} from 'opticsthemebuilder';

const palette = generatePalette('#ff6b6b', 'red');

// Export to Figma Variables format (Light mode)
const figmaDataLight = exportToFigma(palette, 'Light');
console.log(JSON.stringify(figmaDataLight, null, 2));

// Export to Figma Variables format (Dark mode)
const figmaDataDark = exportToFigma(palette, 'Dark');
console.log(JSON.stringify(figmaDataDark, null, 2));

// Export to W3C Design Tokens format
const designTokens = exportToDesignTokens(palette);

// Export to JSON
const json = exportToJSON(palette);

// Export to CSS
const css = exportToCSS(palette);

// Export to Tailwind
const tailwind = exportToTailwind(palette);

// Export all formats to files
const files = exportAll(palette, './output');
console.log('Generated files:', files);
```

### Check Contrast

```javascript
import { getContrastRatio, meetsWCAG_AA, meetsWCAG_AAA } from 'opticsthemebuilder';
import { converter } from 'culori';

const toRgb = converter('rgb');

const background = toRgb('#3b82f6');
const foreground = toRgb('#ffffff');

const ratio = getContrastRatio(background, foreground);
console.log(`Contrast: ${ratio.toFixed(2)}:1`);

const passesAA = meetsWCAG_AA(ratio);
const passesAAA = meetsWCAG_AAA(ratio);

console.log('WCAG AA:', passesAA ? 'Pass' : 'Fail');
console.log('WCAG AAA:', passesAAA ? 'Pass' : 'Fail');
```

## Color Input Formats

OpticsThemeBuilder accepts any valid CSS color format:

- **Hex**: `#3b82f6`, `#38f`
- **RGB**: `rgb(59, 130, 246)`, `rgba(59, 130, 246, 0.5)`
- **HSL**: `hsl(217, 91%, 60%)`, `hsla(217, 91%, 60%, 0.5)`
- **Named Colors**: `blue`, `rebeccapurple`, `hotpink`

## Understanding the Output

### Color Stops

Each palette contains 16 stops (by default) distributed from light to dark:

- **Stop 0-3**: Very light shades (backgrounds, subtle UI)
- **Stop 4-7**: Light to medium shades (hover states, secondary UI)
- **Stop 8-11**: Medium to dark shades (primary buttons, active states)
- **Stop 12-15**: Very dark shades (text, high contrast elements)

### Figma Variables Import

The generated `.tokens.json` files use Figma's native Variables import format:

1. **Open Figma Variables Panel**
   - Menu → Libraries → Variables
   
2. **Import Variables**
   - Click "..." menu → "Import variables"
   - Select your `palette-light.tokens.json` file
   - Import to create Light mode
   
3. **Import Dark Mode** (optional)
   - Select your `palette-dark.tokens.json` file
   - Import to the same collection
   - Figma will automatically add the Dark mode

The format follows Figma's exact specification with:
- Nested variable structure for organization
- Color values in sRGB space (0-1 range)
- Per-mode file structure
- Proper `$extensions` metadata

See [FIGMA_VARIABLES_FORMAT.md](FIGMA_VARIABLES_FORMAT.md) for complete format documentation.

### Foreground Colors

For each background stop, you get two foreground options:

- **Light Foreground**: Near-white color with subtle hue matching the background
- **Dark Foreground**: Near-black color with subtle hue matching the background

The `recommendedForeground` field tells you which has better contrast.

### WCAG Compliance

- **WCAG AA**: Minimum 4.5:1 contrast for normal text, 3:1 for large text
- **WCAG AAA**: Minimum 7:1 contrast for normal text, 4.5:1 for large text

## Export Formats

### Figma Variables (`-figma.json`)

Import directly into Figma using the Variables panel:

**How to Import:**
1. Open your Figma file
2. Open the Variables panel (right sidebar)
3. Click the "Import" button
4. Select your `*-figma.json` file
5. All color variables will be imported into a new collection

The file structure matches Figma's Variables API format:

```json
{
  "variableCollections": {
    "VariableCollectionId:blue": {
      "name": "blue",
      "modes": [...],
      "variableIds": [...]
    }
  },
  "variables": {
    "VariableID:blue/0": {
      "name": "blue/0",
      "resolvedType": "COLOR",
      "valuesByMode": {
        "default": {
          "r": 0.922,
          "g": 0.943,
          "b": 0.977,
          "a": 1
        }
      },
      "description": "Background color - Stop 0"
    }
  }
}
```

Each palette creates:
- **Background colors**: `blue/0` through `blue/15`
- **Light foregrounds**: `blue/0/fg-light` through `blue/15/fg-light`
- **Dark foregrounds**: `blue/0/fg-dark` through `blue/15/fg-dark`

### JSON (`.json`)

Complete palette data with all color information:

```json
{
  "name": "blue",
  "baseColor": {
    "hsl": { "h": 217, "s": 0.91, "l": 0.60 },
    "rgb": { "r": 0.231, "g": 0.510, "b": 0.965 },
    "hex": "#3b82f6"
  },
  "stops": [...]
}
```

### CSS Custom Properties (`.css`)

Ready-to-use CSS variables:

```css
:root {
  --blue-0: #ebf1f9;
  --blue-0-rgb: 235, 241, 249;
  --blue-0-hsl: 217, 55%, 95%;
  --blue-0-fg-light: #fafafa;
  --blue-0-fg-dark: #131416;
  --blue-0-fg: #131416; /* recommended */
}
```

### Tailwind Config (`.js`)

Add to your `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'blue': {
          0: '#ebf1f9',
          1: '#e7eef9',
          // ... etc
        }
      }
    }
  }
}
```

## Use Cases

### Design Systems

Generate consistent color scales for your entire design system:

```bash
optics generate "#3b82f6" --name "primary" --output ./design-tokens
optics generate "#10b981" --name "success" --output ./design-tokens
optics generate "#ef4444" --name "error" --output ./design-tokens
optics generate "#f59e0b" --name "warning" --output ./design-tokens
```

### Accessibility Audits

Quickly check if your color combinations meet WCAG standards:

```bash
optics analyze "#your-brand-blue" "#ffffff"
```

### Figma Variables Import

Generate palettes and import them directly into Figma:

```bash
# Generate Figma-compatible file
optics generate "#3b82f6" --name "primary"

# Import the *-figma.json file in Figma:
# 1. Open Variables panel
# 2. Click "Import" button  
# 3. Select primary-figma.json
# 4. Your color system is now ready to use!
```

All variables include descriptions with contrast ratios and WCAG compliance information.

### Dark Mode Themes

Generate complementary light and dark mode palettes by using different base lightness values.

## Algorithm Details

### Perceptual Distribution

Colors are distributed using an easing function to create more stops in the mid-range where the human eye is most sensitive to changes.

### Saturation Adjustment

- Very light colors (L > 90%): Saturation is reduced to avoid garish pastels
- Very dark colors (L < 20%): Saturation is reduced to maintain depth
- Mid-range colors: Saturation is maintained or slightly boosted

### Foreground Generation

- Light foregrounds: ~98% lightness, minimal saturation
- Dark foregrounds: ~8% lightness, slight saturation for warmth
- Both maintain the base color's hue for visual coherence

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { ColorPalette, ColorStop, HSLColor } from 'opticsthemebuilder';

const palette: ColorPalette = generatePalette('#3b82f6');
const stop: ColorStop = palette.stops[0];
const hsl: HSLColor = stop.background.hsl;
```

## Requirements

- Node.js 14 or higher
- NPM or Yarn

## Dependencies

- `culori` - Color manipulation and conversion
- `commander` - CLI interface

## Optics Scale Format

The **Optics format** provides an alternative color scale system with semantic naming and built-in light/dark mode support:

- **19 semantic stops**: `plus-max`, `plus-eight`, ..., `base`, ..., `minus-eight`, `minus-max`
- **Light/Dark modes**: Automatic theme switching with CSS `light-dark()` function
- **Three colors per stop**: background, "on" (primary foreground), "on-alt" (alternative foreground)
- **F-stop naming**: Photography-inspired names for intuitive luminosity control

### Quick Start with Optics Format

```bash
# Generate Optics palette
optics generate "#3b82f6" --name "primary" --optics

# Use in CSS
:root {
  --op-color-primary-base: light-dark(hsl(217 91% 40%), hsl(217 91% 38%));
  --op-color-primary-on-base: light-dark(hsl(217 91% 100%), hsl(217 91% 100%));
}
```

### Programmatic Usage

```javascript
import { generateOpticsPalette, exportOpticsToCSS } from 'opticsthemebuilder';

const palette = generateOpticsPalette('#3b82f6', 'primary');
const css = exportOpticsToCSS(palette);
```

**📖 Full Documentation**: See [OPTICS_FORMAT.md](OPTICS_FORMAT.md) for complete guide, examples, and API reference.

**💡 Examples**: Run `node example-optics.js` to see comprehensive usage examples.

## Figma Export Compatibility

✅ **Fully compatible with Figma Variables import**

The `--optics` format generates Figma-compatible exports that match the Design Tokens structure expected by Figma's Variables plugin.

### Import into Figma

1. Generate your palette:
   ```bash
   optics generate "#2a659f" --name "primary" --optics --format figma
   ```

2. In Figma:
   - Open the **Variables** panel (right sidebar)
   - Click the **book icon** (Import/Export)
   - Select **Import variables**
   - Choose your `*-optics-figma.json` file
   - Figma imports as a collection with Light/Dark modes

3. Use in designs:
   - Select any frame or element
   - In color picker, click the **🔗** icon
   - Choose from your imported variables
   - Switch between Light/Dark modes to see values update

### What Gets Imported

- **Collection**: Named after your palette (e.g., "Primary Colors")
- **Modes**: Light and Dark (114 tokens total)
- **Tokens per mode**: 57 variables
  - 19 background colors (`*-bg`)
  - 19 primary foregrounds (`*-on`)
  - 19 alternative foregrounds (`*-on-alt`)
- **Contrast info**: Each foreground includes contrast ratio in description

### Format Validation

The export format has been validated against Figma plugin exports:
- ✅ Matches Figma's Design Tokens structure
- ✅ Includes all required fields (`$codeSyntax`, `$scopes`, `$type`, `$value`)
- ✅ Supports multi-mode theming (Light/Dark)
- ✅ Compatible with Figma Variables import/export

📖 **See [FORMAT_VALIDATION.md](FORMAT_VALIDATION.md)** for detailed format comparison and validation.

## License

ISC

## Contributing

Contributions welcome! Please open an issue or PR.

## Author

Built with ❤️ for designers and developers who care about accessibility.

---

**Pro Tip**: For the best results, start with colors that have medium lightness (40-60%) and high saturation (70-100%). This gives the algorithm the most room to generate a full range of tints and shades.