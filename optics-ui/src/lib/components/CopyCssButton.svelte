<script lang="ts">
  import { exportOpticsCSS, copyToClipboard, type ThemeColorType } from '../utils/css-export';
  import styles from './CopyCssButton.module.css';

  /** The color types to render. One for a section header, all enabled ones for the toolbar. */
  export let types: ThemeColorType[] = [];
  /** Icon-only, sized to sit inside a ColorTypeSection header. */
  export let compact = false;
  export let title = 'Copy Optics CSS variable overrides';

  function handleCopy() {
    void copyToClipboard(exportOpticsCSS(types));
  }
</script>

<button
  class={`${styles.button} ${compact ? styles.compact : ''}`}
  on:click|stopPropagation={handleCopy}
  disabled={types.length === 0}
  {title}
  aria-label={compact ? title : undefined}
>
  <i class="ph-bold ph-copy"></i>
  {#if !compact}Copy CSS{/if}
</button>
