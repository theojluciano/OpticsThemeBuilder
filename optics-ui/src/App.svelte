<script lang="ts">
  import ColorTypeSection from './lib/components/ColorTypeSection.svelte';
  import AddCustomColorType from './lib/components/AddCustomColorType.svelte';
  import Export from './lib/components/Export.svelte';
  import { colorTypes } from './lib/stores/color-types';
  import styles from './App.module.css';

  function handleModeChange(mode: 'light' | 'dark') {
    colorTypes.setMode(mode);
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
            <i class="ph-sun-bold"></i>
          </button>
          <button 
            class={$colorTypes.mode === 'dark' ? styles.active : ''}
            on:click={() => handleModeChange('dark')}
            title="Dark mode"
          >
            <i class="ph-moon-bold"></i>
          </button>
        </div>
        
        <Export />
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