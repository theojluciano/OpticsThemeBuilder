# Figma Variables Export Format

## Overview

This document explains the correct format for exporting color palettes to Figma's native Variables import feature. This format is **different** from plugin exports and design tokens formats.

## Key Differences

### ❌ What Doesn't Work

1. **Array wrapper format** (used by some plugins)
2. **"modes" object wrapper** (used by some plugins)
3. **W3C Design Tokens format** (different structure)
4. **Flat variable list** (Figma expects nested structure)

### ✅ What Works

The correct format is:
- Single JSON object (not an array)
- No "modes" wrapper
- One file per mode (Light, Dark, etc.)
- Nested variable structure
- Specific `$extensions` metadata

## Format Structure

```json
{
  "palette-name": {
    "stop-1": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": {
          "r": 0.5,
          "g": 0.5,
          "b": 0.5
        },
        "alpha": 1,
        "hex": "#808080"
      },
      "$extensions": {
        "com.figma.variableId": "VariableID:123:456",
        "com.figma.scopes": ["ALL_SCOPES"],
        "com.figma.codeSyntax": {
          "WEB": "#808080"
        }
      }
    }
  },
  "$extensions": {
    "com.figma.modeName": "Light"
  }
}
```

## Field Descriptions

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `$type` | Variable type | `"color"` |
| `$value` | Color value object | See below |
| `$extensions` | Figma metadata | See below |

### Color Value Object

```json
{
  "colorSpace": "srgb",
  "components": [
    0.0,  // Red (0-1)
    0.0,  // Green (0-1)
    0.0   // Blue (0-1)
  ],
  "alpha": 1,  // Opacity (0-1)
  "hex": "#000000"
}
```

**Important Notes:**
- `components` must be an **array** of three numbers: `[r, g, b]`
- RGB values are 0-1 (not 0-255)
- `colorSpace` must be `"srgb"`
- `hex` value is optional but recommended
- `alpha` must be present (use 1 for opaque)

### Extensions Object

```json
{
  "com.figma.variableId": "VariableID:abc123",
  "com.figma.scopes": ["ALL_SCOPES"],
  "com.figma.codeSyntax": {
    "WEB": "#808080"
  }
}
```

**Field Details:**
- `com.figma.variableId`: Unique identifier (can be generated)
- `com.figma.scopes`: Array of scope strings
  - Common values: `["ALL_SCOPES"]`, `["FRAME_FILL", "SHAPE_FILL"]`
- `com.figma.codeSyntax`: Platform-specific code snippets
  - `WEB`: CSS color value
  - `ANDROID`: Android color code (optional)
  - `iOS`: iOS color code (optional)

### Root Extensions

```json
{
  "$extensions": {
    "com.figma.modeName": "Light"
  }
}
```

The root-level `$extensions` object specifies the mode name:
- `"Light"` for light mode
- `"Dark"` for dark mode
- Custom mode names are supported

## Variable Nesting

Variables can be nested to create groups:

```json
{
  "palette": {
    "primary": {
      "base": { "$type": "color", ... },
      "plus": {
        "one": { "$type": "color", ... },
        "two": { "$type": "color", ... }
      },
      "minus": {
        "one": { "$type": "color", ... },
        "two": { "$type": "color", ... }
      }
    }
  }
}
```

This creates a hierarchy in Figma's Variables panel:
```
palette/
  primary/
    base
    plus/
      one
      two
    minus/
      one
      two
```

## Multi-Mode Support

### Option 1: Separate Files (Recommended)

Create one file per mode:

**palette-light.tokens.json:**
```json
{
  "palette": { ... },
  "$extensions": {
    "com.figma.modeName": "Light"
  }
}
```

**palette-dark.tokens.json:**
```json
{
  "palette": { ... },
  "$extensions": {
    "com.figma.modeName": "Dark"
  }
}
```

Import each file separately in Figma's Variables panel.

### Option 2: Mode-Specific Values

Variables can reference different colors per mode using aliases (advanced).

## Import Process

1. **Open Figma Variables Panel**
   - Menu → Libraries → Variables
   - Or use the keyboard shortcut

2. **Create or Select Collection**
   - Click "+" to create new collection
   - Or select existing collection

3. **Import Variables**
   - Click "..." menu → "Import variables"
   - Select your `.tokens.json` file
   - Choose import options (merge/replace)

4. **Import Multiple Modes**
   - Import light mode file first
   - Import dark mode file to same collection
   - Figma will merge them automatically

## Using OpticsThemeBuilder

### Generate Figma Variables

```bash
# Generate both Light and Dark modes
npx optics generate "#3B82F6" --name primary --format figma

# Generate only Light mode
npx optics generate "#3B82F6" --name primary --format figma --mode light

# Generate only Dark mode
npx optics generate "#3B82F6" --name primary --format figma --mode dark
```

### Output Files

The tool generates:
- `primary-light.tokens.json` - Light mode variables
- `primary-dark.tokens.json` - Dark mode variables

### File Naming Convention

Use `.tokens.json` extension for Figma compatibility:
- ✅ `palette-light.tokens.json`
- ✅ `colors-dark.tokens.json`
- ❌ `palette-figma.json` (works but not standard)

## Validation

To validate your export format:

1. **Export from Figma**
   - Create a test variable in Figma
   - Export it using "Export variables" option
   - Compare structure with your export

2. **Test Import**
   - Try importing your file into Figma
   - Check for any error messages
   - Verify variables appear correctly

3. **Common Issues**
   - RGB values outside 0-1 range
   - Missing `$extensions` object
   - Wrong `colorSpace` value
   - Invalid variable names (use alphanumeric + dash/underscore)

## Complete Example

```json
{
  "op-color": {
    "primary": {
      "base": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [
            0.23137254901960785,
            0.5098039215686274,
            0.9647058823529412
          ],
          "alpha": 1,
          "hex": "#3B82F6"
        },
        "$extensions": {
          "com.figma.variableId": "VariableID:1234:5678",
          "com.figma.scopes": ["ALL_SCOPES"],
          "com.figma.codeSyntax": {
            "WEB": "#3B82F6"
          }
        }
      },
      "plus": {
        "one": {
          "$type": "color",
          "$value": {
            "colorSpace": "srgb",
            "components": [
              0.5450980392156862,
              0.6784313725490196,
              0.9725490196078431
            ],
            "alpha": 1,
            "hex": "#8BADF8"
          },
          "$extensions": {
            "com.figma.variableId": "VariableID:1234:5679",
            "com.figma.scopes": ["ALL_SCOPES"],
            "com.figma.codeSyntax": {
              "WEB": "#8BADF8"
            }
          }
        }
      }
    }
  },
  "$extensions": {
    "com.figma.modeName": "Light"
  }
}
```

## Resources

- [Figma Variables Documentation](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)
- [Figma Community: Variables](https://forum.figma.com/tag/variables)
- [W3C Design Tokens](https://design-tokens.github.io/community-group/format/) (different format)

## Troubleshooting

### Import Fails

**Problem:** Figma shows "Invalid format" error

**Solutions:**
1. Verify `components` is an **array** `[r, g, b]`, not an object
2. Check RGB values are 0-1 (not 0-255)
3. Verify `colorSpace` is exactly `"srgb"`
4. Ensure `$type` is `"color"`
5. Check for syntax errors (trailing commas, etc.)
6. Validate JSON with a linter

### Variables Don't Appear

**Problem:** Import succeeds but no variables show

**Solutions:**
1. Check you're in the correct collection
2. Look for variables under nested groups
3. Refresh the Variables panel
4. Try importing to a new collection

### Mode Not Recognized

**Problem:** Import creates new mode instead of updating

**Solutions:**
1. Ensure `com.figma.modeName` exactly matches existing mode
2. Mode names are case-sensitive
3. Import to same collection, not a new one
4. Check for extra spaces in mode name

---

**Last Updated:** 2024
**Format Version:** Figma Variables 2023+