<script lang="ts">
  import { palette } from '../stores/palette';
  import { exportFigmaJSON, downloadFile } from '../utils/export';
  import { OPTICS_STOPS } from '../data/defaults';
  import styles from './Export.module.css';

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

<div class={styles.export}>
  <h3 class={styles.title}>Export Options</h3>
  <div class={styles.buttons}>
    <button class={styles.button} on:click={() => handleExport('light')}>
      Export Figma (Light)
    </button>
    <button class={styles.button} on:click={() => handleExport('dark')}>
      Export Figma (Dark)
    </button>
    <button class="{styles.button} {styles.secondary}" on:click={handleExportConfig}>
      Export Config JSON
    </button>
  </div>
</div>