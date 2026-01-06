<script lang="ts">
  import { palette } from '../stores/palette';
  import { parseBaseColor } from '../utils/colors';
  import * as culori from 'culori';
  import styles from './Controls.module.css';

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

<div class={styles.controls}>
  <input 
    type="color" 
    class={styles.colorInput}
    value={colorPickerValue}
    on:input={handleColorPickerChange}
  />
  <div class={styles.hslInputs}>
    <label class={styles.hslLabel}>
      H:
      <input 
        type="number" 
        class={styles.numberInput}
        min="0" 
        max="360" 
        bind:value={hInput}
        on:input={handleHSLInput}
      />
    </label>
    <label class={styles.hslLabel}>
      S:
      <input 
        type="number" 
        class={styles.numberInput}
        min="0" 
        max="100" 
        bind:value={sInput}
        on:input={handleHSLInput}
      />
    </label>
  </div>
  <button class={styles.button} on:click={handleGenerate}>Generate Palette</button>
</div>