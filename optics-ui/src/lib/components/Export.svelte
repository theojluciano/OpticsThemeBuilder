<script lang="ts">
  import { palette } from '../stores/palette';
  import { exportFigmaJSON, downloadFile } from '../utils/export';
  import { OPTICS_STOPS } from '../data/defaults';

  function handleExport(mode: 'light' | 'dark') {
    const bgValues = mode === 'light' ? $palette.lightBg : $palette.darkBg;
    const onValues = mode === 'light' ? $palette.lightOn : $palette.darkOn;
    const onAltValues = mode === 'light' ? $palette.lightOnAlt : $palette.darkOnAlt;

    const stops: any = {};
    OPTICS_STOPS.forEach(stop => {
      stops[stop] = {
        bg: bgValues[stop],
        on: onValues[stop],
        onAlt: onAltValues[stop]
      };
    });

    const data = {
      name: $palette.name,
      h: $palette.h,
      s: $palette.s,
      mode,
      stops
    };

    const json = exportFigmaJSON(data);
    const filename = `${$palette.name}-${mode}.tokens.json`;
    downloadFile(json, filename);
  }

  function handleExportConfig() {
    const config = {
      name: $palette.name,
      baseColor: $palette.baseColor,
      h: $palette.h,
      s: $palette.s,
      light: {
        bg: $palette.lightBg,
        on: $palette.lightOn,
        onAlt: $palette.lightOnAlt
      },
      dark: {
        bg: $palette.darkBg,
        on: $palette.darkOn,
        onAlt: $palette.darkOnAlt
      }
    };

    const json = JSON.stringify(config, null, 2);
    downloadFile(json, `${$palette.name}-config.json`);
  }
</script>

<div class="export">
  <h3>Export Options</h3>
  <div class="buttons">
    <button on:click={() => handleExport('light')}>
      Export Figma (Light)
    </button>
    <button on:click={() => handleExport('dark')}>
      Export Figma (Dark)
    </button>
    <button class="secondary" on:click={handleExportConfig}>
      Export Config JSON
    </button>
  </div>
</div>

<style>
  .export {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
  }

  h3 {
    color: #e5e5e5;
    margin-bottom: 15px;
    font-size: 18px;
  }

  .buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  button {
    padding: 12px 24px;
    background: #10b981;
    border: none;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    font-size: 14px;
  }

  button:hover {
    background: #059669;
  }

  button.secondary {
    background: #6b7280;
  }

  button.secondary:hover {
    background: #4b5563;
  }
</style>
