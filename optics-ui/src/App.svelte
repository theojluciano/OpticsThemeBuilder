<script lang="ts">
  import ColorTypeSection from './lib/components/ColorTypeSection.svelte';
  import AddCustomColorType from './lib/components/AddCustomColorType.svelte';
  import FullPagePreview from './lib/components/FullPagePreview.svelte';
  import PreviewButton from './lib/components/PreviewButton.svelte';
  import Export from './lib/components/Export.svelte';
  import { colorTypes } from './lib/stores/color-types';
  import styles from './App.module.css';

  let isPreviewOpen = false;

  function handleModeChange(mode: 'light' | 'dark') {
    colorTypes.setMode(mode);
  }

  function openPreview() {
    isPreviewOpen = true;
  }

  function closePreview() {
    isPreviewOpen = false;
  }

  function handleReset() {
    if (confirm('Are you sure you want to reset all colors to default? This will delete all custom color types and reset all values.')) {
      colorTypes.reset();
    }
  }
</script>

<div class={styles.container}>
  <header class={styles.header}>
    <div class={styles.headerContent}>
      <div class={styles.logoContainer}>
        <img src="/logo.svg" alt="Bifrost Logo" class={styles.logo} />
      </div>
      <div class={styles.headerControls}>
        <div class={styles.toggle}>
          <button 
            class={$colorTypes.mode === 'light' ? styles.active : ''}
            on:click={() => handleModeChange('light')}
            title="Light mode"
          >
            <i class="ph-bold ph-sun"></i>
          </button>
          <button 
            class={$colorTypes.mode === 'dark' ? styles.active : ''}
            on:click={() => handleModeChange('dark')}
            title="Dark mode"
          >
            <i class="ph-bold ph-moon"></i>
          </button>
        </div>
        
        <PreviewButton on:click={openPreview} />
        <Export />
        
        <button class={styles.resetButton} on:click={handleReset} title="Reset to Defaults" aria-label="Reset to defaults">
          <i class="ph-bold ph-bomb"></i>
        </button>
      </div>
    </div>
  </header>

  <div class={styles.colorTypesContainer}>
    {#each $colorTypes.colorTypes as colorType (colorType.id)}
      <ColorTypeSection {colorType} />
    {/each}
    
    <AddCustomColorType />
  </div>
</div>

<FullPagePreview isOpen={isPreviewOpen} onClose={closePreview} />