<script lang="ts">
  import Controls from './lib/components/Controls.svelte';
  import Summary from './lib/components/Summary.svelte';
  import ColorStopCard from './lib/components/ColorStopCard.svelte';
  import Export from './lib/components/Export.svelte';
  import { OPTICS_STOPS } from './lib/data/defaults';
  import { palette } from './lib/stores/palette';

  let nameInput = $palette.name;

  function handleModeChange(mode: 'light' | 'dark') {
    palette.setMode(mode);
  }

  function handleNameChange() {
    palette.setName(nameInput);
  }
</script>

<div class="container">
  <header>
    <div class="header-content">
      <div class="logo-container">
        <img src="/logo.svg" alt="Bifrost Logo" class="logo" />
      </div>
      <Controls />
    </div>
  </header>

  <div class="config-section">
    <div class="config-row">
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

    <div class="config-row">
      <label>
        Mode
        <div class="toggle">
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

  <div class="grid">
    {#each OPTICS_STOPS as stop}
      <ColorStopCard {stop} />
    {/each}
  </div>

  <Export />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #0f0f0f;
    color: #e5e5e5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .container {
    max-width: 1800px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    margin-bottom: 20px;
  }

  .header-content {
    display: flex;
    gap: 20px;
    align-items: center;
  }


  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  @media (min-width: 620px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1200px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1600px) {
    .grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .logo-container {
    background: white;
    padding: 12px 20px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
  }

  .logo {
    height: 80px;
    width: auto;
    display: block;
  }

  header :global(.controls) {
    flex: 1;
    margin-bottom: 0;
  }

  .config-section {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .config-row {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .config-section label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-weight: 500;
    color: #e5e5e5;
    font-size: 14px
  }

  .config-section input[type="text"] {
    padding: 8px 12px;
    background: #0f0f0f;
    border: 1px solid #444;
    border-radius: 8px;
    color: #e5e5e5;
    width: 200px;
    font-size: 14px;
    height: 40px;
  }

  .config-section input[type="text"]:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .config-section .toggle {
    display: flex;
    gap: 8px;
    background: #0f0f0f;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid #444;
  }

  .config-section .toggle button {
    background: transparent;
    color: #888;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
  }

  .config-section .toggle button.active {
    background: #3b82f6;
    color: white;
  }

  .config-section .toggle button:hover {
    background: #3b82f6;
    color: white;
  }
</style>
