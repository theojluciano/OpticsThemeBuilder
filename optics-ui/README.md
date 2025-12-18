# Optics Theme Builder - Svelte UI

A modern, interactive web application for creating accessible color palettes with live WCAG contrast checking.

## Features

✨ **Real-time Contrast Checking**
- Instant WCAG AA compliance validation (4.5:1 minimum)
- Visual pass/fail indicators
- Live contrast ratio calculations

🎨 **Interactive Adjustments**
- Adjust luminosity with smooth sliders
- See color changes immediately
- Preview all 19 Optics color stops

🌓 **Light & Dark Mode**
- Independent editing for each mode
- Switch between modes with one click
- Maintains separate values per mode

📊 **Summary Dashboard**
- Total passing/failing tests at a glance
- Cards with failures highlighted in red
- Real-time statistics

💾 **Export Options**
- Figma Variables JSON (Light & Dark modes)
- Config JSON (save your custom values)
- One-click downloads

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
# http://localhost:5173
```

## Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run check
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ColorStopCard.svelte   # Individual color stop with sliders
│   │   ├── Controls.svelte        # Header controls (color input, mode toggle)
│   │   ├── Summary.svelte         # Stats dashboard
│   │   └── Export.svelte          # Export buttons
│   ├── stores/
│   │   └── palette.ts             # Svelte store for state management
│   ├── utils/
│   │   ├── colors.ts              # Color conversion & contrast calculations
│   │   └── export.ts              # Figma JSON export logic
│   └── data/
│       └── defaults.ts            # Default Optics lightness values
├── App.svelte                     # Main app component
├── main.ts                        # Entry point
└── app.css                        # Global styles
```

## How It Works

### State Management

Uses Svelte stores for reactive state management:

```typescript
import { palette } from './lib/stores/palette';

// Update values
palette.updateBg('base', 40);
palette.updateOn('plus-max', 0);
palette.setMode('dark');

// Subscribe to changes
$palette.mode // 'light' | 'dark'
$palette.h    // Hue (0-360)
$palette.s    // Saturation (0-100)
```

### Reactive Updates

Svelte's reactivity system automatically updates UI when state changes:

```svelte
<script>
  $: bgColor = makeColor($palette.h, $palette.s, bgValue);
  $: contrast = getContrast(bgColor, onColor);
  $: passes = contrast >= 4.5;
</script>

<div class:fail={!passes}>
  {contrast.toFixed(2)}:1
</div>
```

### Component Communication

All components share the same store, enabling seamless data flow:

- `Controls` updates base color and mode
- `ColorStopCard` updates individual stop values
- `Summary` calculates statistics from all stops
- `Export` reads all values for export

## Usage Guide

### 1. Generate Palette

1. Enter a base color (e.g., `#3b82f6`)
2. Enter a palette name (e.g., `primary`)
3. Click "Generate Palette"

### 2. Adjust Values

Each color stop has three sliders:
- **Background**: The background color lightness (0-100%)
- **On**: Primary foreground color lightness
- **On-Alt**: Alternative foreground color lightness

**Tips:**
- Light backgrounds need dark foregrounds
- Dark backgrounds need light foregrounds
- Minimum contrast: 4.5:1 (WCAG AA)
- Target: 7:1+ (WCAG AAA)

### 3. Switch Modes

Click **Light** or **Dark** button to edit:
- Each mode has independent values
- Changes only affect current mode
- Preview updates immediately

### 4. Export

When satisfied with contrast ratios:
1. Click **Export Figma (Light)** → Downloads `{name}-light.tokens.json`
2. Click **Export Figma (Dark)** → Downloads `{name}-dark.tokens.json`
3. Import both files into Figma Variables panel

## Technical Details

### Dependencies

- **Svelte** - Reactive UI framework
- **TypeScript** - Type safety
- **Culori** - Color manipulation and conversion
- **Vite** - Build tool and dev server

### Color Calculations

Uses WCAG 2.0 relative luminance formula:

```typescript
const L = 0.2126 * R^2.2 + 0.7152 * G^2.2 + 0.0722 * B^2.2
contrast = (max(L1, L2) + 0.05) / (min(L1, L2) + 0.05)
```

### Figma Export Format

Exports to Figma Variables JSON format with proper structure:

```json
{
  "palette-name": {
    "base": { "$type": "color", "$value": {...} },
    "plus": {
      "max": { "$type": "color", "$value": {...} }
    },
    "minus": {...},
    "on": {
      "base": {...},
      "plus": {...},
      "minus": {...}
    }
  },
  "$extensions": {
    "com.figma.modeName": "Light"
  }
}
```

## Keyboard Shortcuts

- **Tab** - Navigate between sliders
- **Arrow keys** - Adjust slider values
- **Shift + Arrows** - Larger adjustments
- **Space** - Toggle slider

## Browser Support

✅ Chrome/Edge (Recommended)
✅ Firefox
✅ Safari
✅ Opera

## Performance

- **Hot Module Reloading** - Instant updates during development
- **Reactive Updates** - Only affected components re-render
- **Small Bundle** - ~50KB gzipped (including culori)
- **Fast Dev Server** - Vite provides instant startup

## Customization

### Modify Default Values

Edit `src/lib/data/defaults.ts`:

```typescript
export const LIGHT_MODE_BG: Record<OpticsStopName, number> = {
  'plus-max': 100,
  'base': 40, // Change this
  // ...
};
```

### Add New Features

1. Create new component in `src/lib/components/`
2. Import and use in `App.svelte`
3. Access state via `$palette` store

### Customize Styles

Each component has scoped styles. Global styles in `src/app.css`.

## Troubleshooting

**Sliders not responding?**
- Check browser console for errors
- Ensure all dependencies installed: `npm install`
- Restart dev server: `Ctrl+C` then `npm run dev`

**Colors look wrong?**
- Verify base color is valid hex format (#rrggbb)
- Try different base color
- Check H and S values in console

**Export not working?**
- Allow downloads in browser
- Check browser console for errors
- Try different browser

**Type errors?**
- Run type check: `npm run check`
- Ensure TypeScript is up to date
- Check import paths

## Building for Production

```bash
# Build
npm run build

# Preview
npm run preview

# Deploy dist/ folder to your hosting
```

The build outputs to `dist/` directory. Deploy this to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting

## Contributing

To add features or fix bugs:

1. Create a new branch
2. Make changes
3. Test thoroughly: `npm run check && npm run build`
4. Submit PR

## License

Same as parent OpticsThemeBuilder project.

## Need Help?

- Check parent `README.md` for overall project info
- See `INTERACTIVE_WORKFLOW.md` for adjustment strategies
- Review `OPTICS_FORMAT.md` for format details

---

**Built with Svelte + TypeScript + Vite** 🚀