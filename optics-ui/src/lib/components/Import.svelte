<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { colorTypes } from '../stores/color-types';
  import { parseImportJSON } from '../utils/import';
  import styles from './Import.module.css';

  const dispatch = createEventDispatcher<{ error: string }>();

  let fileInput: HTMLInputElement;

  function handleImportClick() {
    fileInput.click();
  }

  async function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    target.value = '';

    try {
      const text = await file.text();
      const result = parseImportJSON(text);
      colorTypes.importPalette(result);
    } catch (err: unknown) {
      dispatch('error', err instanceof Error ? err.message : 'Unknown error during import');
    }
  }
</script>

<input
  bind:this={fileInput}
  type="file"
  accept=".json,application/json"
  style="display: none"
  on:change={handleFileChange}
/>

<button class={styles.importButton} on:click={handleImportClick} title="Import Optics JSON">
  <i class="ph-bold ph-upload-simple"></i>
  Import
</button>
