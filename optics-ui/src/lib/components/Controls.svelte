<script lang="ts">
  import { colorTypes } from '../stores/color-types';
  import { parseBaseColor } from '../utils/colors';
  import * as culori from 'culori';
  import styles from './Controls.module.css';

  let colorPickerValue = '#3b82f6';
  let hInput = 217;
  let sInput = 91;

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
</script>

<div class={styles.controls}>
  <div class={styles.label}>Base Color</div>
  <div class={styles.controlsRow}>
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
  </div>
</div>