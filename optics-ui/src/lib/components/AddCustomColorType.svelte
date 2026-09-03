<script lang="ts">
  import { colorTypes } from '../stores/color-types';
  import { makeColor, parseBaseColor } from '../utils/colors';
  import styles from './AddCustomColorType.module.css';
  import sharedStyles from '../styles/shared.module.css';

  let isExpanded = false;
  let customName = '';
  let colorPickerValue = '#3b82f6';
  let hInput = 217;
  let sInput = 91;
  let lInput = 48;

  // Sync color picker display with HSL values
  $: colorPickerValue = makeColor(hInput, sInput, lInput);

  function handleColorPickerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const result = parseBaseColor(target.value);
    if (result) {
      hInput = Math.round(result.h);
      sInput = Math.round(result.s);
      lInput = Math.round(result.l);
    }
  }

  function handleHSLInput() {
    // Clamp values
    hInput = Math.max(0, Math.min(360, hInput));
    sInput = Math.max(0, Math.min(100, sInput));
    lInput = Math.max(0, Math.min(100, lInput));
  }

  function handleAdd() {
    if (customName.trim()) {
      colorTypes.addCustomColorType(customName.trim(), hInput, sInput, lInput);
      // Reset form
      customName = '';
      hInput = 217;
      sInput = 91;
      lInput = 48;
      isExpanded = false;
    }
  }

  function handleCancel() {
    customName = '';
    hInput = 217;
    sInput = 91;
    lInput = 48;
    isExpanded = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && customName.trim()) {
      handleAdd();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<div class={styles.container}>
  {#if !isExpanded}
    <button class={styles.addButton} on:click={() => isExpanded = true}>
      <i class="ph-bold ph-plus"></i>
      Add Custom Color Type
    </button>
  {:else}
    <div class={styles.form}>
      <div class={styles.formHeader}>
        <h4 class={styles.formTitle}>Add Custom Color Type</h4>
      </div>
      
      <div class={styles.formContent}>
        <div class={styles.field}>
          <label class={styles.label}>
            Name
            <input
              type="text"
              class={styles.textInput}
              bind:value={customName}
              on:keydown={handleKeydown}
              placeholder="e.g., Accent"
              autofocus
            />
          </label>
        </div>

        <div class={styles.colorControls}>
          <label class={styles.label}>Base Color</label>
          <div class={styles.controlsRow}>
            <input 
              type="color" 
              class={sharedStyles.colorInput}
              value={colorPickerValue}
              on:input={handleColorPickerChange}
            />
            <div class={sharedStyles.hslInputs}>
              <label class={sharedStyles.hslLabel}>
                H:
                <input 
                  type="number" 
                  class={sharedStyles.numberInput}
                  min="0" 
                  max="360" 
                  bind:value={hInput}
                  on:input={handleHSLInput}
                />
              </label>
              <label class={sharedStyles.hslLabel}>
                S:
                <input 
                  type="number" 
                  class={sharedStyles.numberInput}
                  min="0" 
                  max="100" 
                  bind:value={sInput}
                  on:input={handleHSLInput}
                />
              </label>
              <label class={sharedStyles.hslLabel} title="Lightness of the seed color — sets --op-color-*-l / -original, not a stop on the scale">
                L:
                <input 
                  type="number" 
                  class={sharedStyles.numberInput}
                  min="0" 
                  max="100" 
                  bind:value={lInput}
                  on:input={handleHSLInput}
                />
              </label>
            </div>
          </div>
        </div>

        <div class={styles.formActions}>
          <button 
            class={styles.cancelButton} 
            on:click={handleCancel}
          >
            Cancel
          </button>
          <button 
            class={styles.submitButton} 
            on:click={handleAdd}
            disabled={!customName.trim()}
          >
            Add Color Type
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>