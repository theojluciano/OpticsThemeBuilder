<script lang="ts">
  import { colorTypes } from '../stores/color-types';
  import { exportFigmaJSON, downloadFile } from '../utils/export';
  import { OPTICS_STOPS } from '../data/defaults';
  import styles from './Export.module.css';

  function handleExport() {
    const mode = $colorTypes.mode;
    const enabledTypes = $colorTypes.colorTypes.filter(ct => ct.enabled);
    
    if (enabledTypes.length === 0) {
      alert('Please enable at least one color type to export.');
      return;
    }

    const palettesData = enabledTypes.map(colorType => {
      const bgValues = mode === 'light' ? colorType.lightBg : colorType.darkBg;
      const onValues = mode === 'light' ? colorType.lightOn : colorType.darkOn;
      const onAltValues = mode === 'light' ? colorType.lightOnAlt : colorType.darkOnAlt;

      const stops: any = {};
      OPTICS_STOPS.forEach(stop => {
        stops[stop] = {
          bg: bgValues[stop],
          on: onValues[stop],
          onAlt: onAltValues[stop]
        };
      });

      return {
        name: colorType.name.toLowerCase(),
        h: colorType.h,
        s: colorType.s,
        mode,
        stops
      };
    });

    const json = exportFigmaJSON(palettesData);
    const filename = `optics-${mode}.tokens.json`;
    downloadFile(json, filename);
  }
</script>

<button class={styles.exportButton} on:click={handleExport}>
  <i class="ph-bold ph-figma-logo"></i>
  Export for Figma
</button>