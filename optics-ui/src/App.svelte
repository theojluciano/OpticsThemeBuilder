<script lang="ts">
  import Controls from './lib/components/Controls.svelte';
  import Summary from './lib/components/Summary.svelte';
  import ColorStopCard from './lib/components/ColorStopCard.svelte';
  import Export from './lib/components/Export.svelte';
  import { OPTICS_STOPS } from './lib/data/defaults';
</script>

<div class="container">
  <header>
    <h1>🎨 Optics Theme Builder</h1>
    <p class="subtitle">Adjust luminosity values and check WCAG contrast in real-time</p>
  </header>

  <Controls />
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
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #333;
  }

  h1 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #e5e5e5;
  }

  .subtitle {
    color: #888;
    font-size: 14px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
</style>
