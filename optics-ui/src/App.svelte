<script lang="ts">
  import Controls from './lib/components/Controls.svelte';
  import Summary from './lib/components/Summary.svelte';
  import ColorStopCard from './lib/components/ColorStopCard.svelte';
  import Export from './lib/components/Export.svelte';
  import { OPTICS_STOPS } from './lib/data/defaults';
  import { palette } from './lib/stores/palette';
  import styles from './App.module.css';

  let nameInput = $palette.name;

  function handleModeChange(mode: 'light' | 'dark') {
    palette.setMode(mode);
  }

  function handleNameChange() {
    palette.setName(nameInput);
  }
</script>

<div class={styles.container}>
  <header class={styles.header}>
    <div class={styles.headerContent}>
      <div class={styles.logoContainer}>
        <img src="/logo.svg" alt="Bifrost Logo" class={styles.logo} />
      </div>
      <Controls />
    </div>
  </header>

  <div class={styles.configSection}>
    <div class={styles.configRow}>
      <label>
        Palette Name
        <input 
          type="text" 
          bind:value={nameInput} 
          on:change={handleNameChange} 
          placeholder="primary"
          name="palette-name"
        />
      </label>
    </div>

    <div class={styles.configRow}>
      <label>
        Mode
        <div class={styles.toggle}>
          <button 
            class:active={$palette.mode === 'light'}
            on:click={() => handleModeChange('light')}
          >
            Light
          </button>
          <button 
            class:active={$palette.mode === 'dark'}
            on:click={() => handleModeChange('dark')}
          >
            Dark
          </button>
        </div>
      </label>
    </div>
  </div>

  <Summary />

  <div class={styles.grid}>
    {#each OPTICS_STOPS as stop}
      <ColorStopCard {stop} />
    {/each}
  </div>

  <Export />
</div>
