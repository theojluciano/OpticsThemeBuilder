<script lang="ts">
  import ColorStopCard from './ColorStopCard.svelte';
  import { colorTypes } from '../stores/color-types';
  import { OPTICS_STOPS } from '../data/defaults';
  import { parseBaseColor } from '../utils/colors';
  import { calculateContrastStats } from '../utils/contrast-stats';
  import type { ColorTypeConfig } from '../stores/color-types';
  import * as culori from 'culori';
  import styles from './ColorTypeSection.module.css';
  import sharedStyles from '../styles/shared.module.css';

  export let colorType: ColorTypeConfig;

  let hInput = colorType.h;
  let sInput = colorType.s;
  let colorPickerValue = '#3b82f6';

  // Update local values when colorType changes
  $: {
    hInput = colorType.h;
    sInput = colorType.s;
  }

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
      colorTypes.updateHue(colorType.id, hInput);
      colorTypes.updateSaturation(colorType.id, sInput);
    }
  }

  function handleHueInput(e: Event) {
    const target = e.target as HTMLInputElement;
    hInput = Math.max(0, Math.min(360, +target.value));
    colorTypes.updateHue(colorType.id, hInput);
  }

  function handleSaturationInput(e: Event) {
    const target = e.target as HTMLInputElement;
    sInput = Math.max(0, Math.min(100, +target.value));
    colorTypes.updateSaturation(colorType.id, sInput);
  }

  $: mode = $colorTypes.mode;
  $: bgValues = mode === 'light' ? colorType.lightBg : colorType.darkBg;
  $: onValues = mode === 'light' ? colorType.lightOn : colorType.darkOn;
  $: onAltValues = mode === 'light' ? colorType.lightOnAlt : colorType.darkOnAlt;

  $: stats = calculateContrastStats(
    OPTICS_STOPS,
    colorType.h,
    colorType.s,
    bgValues,
    onValues,
    onAltValues
  );

  $: total = stats.aaa + stats.aa + stats.fail;

  function handleToggle() {
    colorTypes.toggleColorType(colorType.id);
  }

  function handleCollapse() {
    colorTypes.toggleCollapse(colorType.id);
  }

  function handleDelete() {
    if (confirm(`Are you sure you want to delete the "${colorType.name}" color type?`)) {
      colorTypes.removeColorType(colorType.id);
    }
  }

  let isRenaming = false;
  let renameValue = colorType.name;

  function startRename() {
    isRenaming = true;
    renameValue = colorType.name;
  }

  function finishRename() {
    if (renameValue.trim()) {
      colorTypes.renameColorType(colorType.id, renameValue.trim());
    }
    isRenaming = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      finishRename();
    } else if (e.key === 'Escape') {
      isRenaming = false;
    }
  }
</script>

<div class={`${styles.section} ${!colorType.enabled ? styles.disabled : ''}`}>
  <div class={styles.header}>
    <div class={styles.headerLeft}>
      <button 
        class={styles.collapseButton}
        on:click={handleCollapse}
        aria-label={colorType.collapsed ? 'Expand' : 'Collapse'}
      >
        <i class="ph-bold ph-caret-down {colorType.collapsed ? styles.collapsed : ''}"></i>
      </button>
      
      <div class={styles.titleContainer}>
        {#if isRenaming && colorType.isCustom}
          <input
            type="text"
            class={styles.renameInput}
            bind:value={renameValue}
            on:blur={finishRename}
            on:keydown={handleKeydown}
            autofocus
          />
        {:else}
          <h3 class={styles.title} on:dblclick={colorType.isCustom ? startRename : undefined}>
            {colorType.name}
          </h3>
        {/if}

        {#if colorType.isCustom && !isRenaming}
          <span class={styles.customBadge}>Custom</span>
        {/if}
      </div>
    </div>
    <div class={styles.colorControls}>
      <input 
        type="color" 
        class={sharedStyles.colorInput}
        value={colorPickerValue}
        on:input={handleColorPickerChange}
        title="Choose base color"
      />
      <label class={sharedStyles.hslLabel}>
        H:
        <input 
          type="number" 
          class={sharedStyles.numberInput}
          min="0" 
          max="360" 
          value={hInput}
          on:input={handleHueInput}
        />
      </label>
      <label class={sharedStyles.hslLabel}>
        S:
        <input 
          type="number" 
          class={sharedStyles.numberInput}
          min="0" 
          max="100" 
          value={sInput}
          on:input={handleSaturationInput}
        />
      </label>
    </div>
    
    <div class={styles.headerRight}>
      <div class={styles.miniSummary}>
        <span class={`${styles.miniValue} ${styles.pass}`}>{stats.aaa}</span>
        <span class={styles.miniSeparator}>/</span>
        <span class={`${styles.miniValue} ${styles.aa}`}>{stats.aa}</span>
        <span class={styles.miniSeparator}>/</span>
        <span class={`${styles.miniValue} ${styles.fail}`}>{stats.fail}</span>
      </div>

      <label class={styles.toggle}>
        <input
          type="checkbox"
          checked={colorType.enabled}
          on:change={handleToggle}
        />
        <span class={styles.toggleSlider}></span>
      </label>

      {#if colorType.isCustom}
        <button 
          class={styles.deleteButton}
          on:click={handleDelete}
          aria-label="Delete color type"
        >
          <i class="ph-bold ph-trash"></i>
        </button>
      {/if}
    </div>
  </div>

  {#if !colorType.collapsed && colorType.enabled}
    <div class={styles.content}>
      <div class={styles.grid}>
        {#each OPTICS_STOPS as stop}
          <ColorStopCard {stop} colorTypeId={colorType.id} />
        {/each}
      </div>
    </div>
  {/if}
</div>