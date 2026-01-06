<script lang="ts">
  import { palette } from '../stores/palette';
  import { parseBaseColor } from '../utils/colors';
  import * as culori from 'culori';

  let colorPickerValue = $palette.baseColor;
  let hInput = Math.round($palette.h);
  let sInput = Math.round($palette.s);
  let nameInput = $palette.name;

  // Sync color picker display with HSL values
  $: {
    const hslColor = culori.hsl({ h: hInput, s: sInput / 100, l: 0.5 });
    colorPickerValue = culori.formatHex(hslColor);
  }

  function handleColorPickerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const result = parseBaseColor(target.value);
    if (result) {
      hInput = Math.round(result.h);
      sInput = Math.round(result.s);
    }
  }

  function handleHSLInput() {
    // Clamp values
    hInput = Math.max(0, Math.min(360, hInput));
    sInput = Math.max(0, Math.min(100, sInput));
  }

  function handleGenerate() {
    const hslColor = culori.hsl({ h: hInput, s: sInput / 100, l: 0.5 });
    const hexColor = culori.formatHex(hslColor);
    
    palette.setBaseColor(hexColor, hInput, sInput);
    palette.setName(nameInput);
  }

  function handleModeChange(mode: 'light' | 'dark') {
    palette.setMode(mode);
  }
</script>

<div class="controls">
  <div class="row">
    <label>
      Base Color:
      <input 
        type="color" 
        value={colorPickerValue}
        on:input={handleColorPickerChange}
      />
    </label>
    <div class="hsl-inputs">
      <label class="hsl-label">
        H:
        <input 
          type="number" 
          min="0" 
          max="360" 
          bind:value={hInput}
          on:input={handleHSLInput}
        />
      </label>
      <label class="hsl-label">
        S:
        <input 
          type="number" 
          min="0" 
          max="100" 
          bind:value={sInput}
          on:input={handleHSLInput}
        />
      </label>
    </div>
    <button on:click={handleGenerate}>Generate Palette</button>
  </div>


</div>

<style>
  .controls {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .row {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 0;
  }

  label,
  .label-text {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 120px;
    font-weight: 500;
    color: #e5e5e5;
  }

  input[type="color"] {
    width: 60px;
    height: 40px;
    border: 1px solid #444;
    border-radius: 4px;
    background: #0f0f0f;
    cursor: pointer;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  input[type="color"]::-webkit-color-swatch {
    border: 1px solid #666;
    border-radius: 2px;
  }

  .hsl-inputs {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .hsl-label {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: auto;
    font-size: 13px;
    color: #888;
  }

  input[type="number"] {
    width: 65px;
    padding: 6px 8px;
    background: #0f0f0f;
    border: 1px solid #444;
    border-radius: 4px;
    color: #e5e5e5;
    font-size: 14px;
  }

  input[type="number"]:focus {
    outline: none;
    border-color: #3b82f6;
  }

  input[type="text"] {
    padding: 8px 12px;
    background: #0f0f0f;
    border: 1px solid #444;
    border-radius: 4px;
    color: #e5e5e5;
    width: 200px;
    font-size: 14px;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #3b82f6;
  }

  button {
    padding: 8px 20px;
    background: #3b82f6;
    border: none;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    font-size: 14px;
  }

  button:hover {
    background: #2563eb;
  }

  .toggle {
    display: flex;
    gap: 8px;
    background: #0f0f0f;
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #444;
  }

  .toggle button {
    background: transparent;
    color: #888;
    padding: 8px 16px;
  }

  .toggle button.active {
    background: #3b82f6;
    color: white;
  }

  .toggle button:hover {
    background: #3b82f6;
    color: white;
  }
</style>