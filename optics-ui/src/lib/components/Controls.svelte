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
    <input 
      type="color" 
      value={colorPickerValue}
      on:input={handleColorPickerChange}
    />
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


  input[type="color"] {
    width: 60px;
    height: 60px;
    border: 1px solid #444;
    border-radius: 8px;
    background: #0f0f0f;
    cursor: pointer;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 4px;
  }

  input[type="color"]::-webkit-color-swatch {
    border: 1px solid #666;
    border-radius: 4px;
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
    font-size: 14px;
    color: #888;
  }

  input[type="number"] {
    width: 65px;
    padding: 6px 8px;
    background: #0f0f0f;
    border: 1px solid #444;
    border-radius: 8px;
    color: #e5e5e5;
    font-size: 14px;
    height: 40px;
  }

  input[type="number"]:focus {
    outline: none;
    border-color: #3b82f6;
  }

  button {
    padding: 8px 20px;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    font-size: 14px;
    height: 40px;
  }

  button:hover {
    background: #2563eb;
  }

</style>