<script lang="ts">
  import { colorTypes } from '../stores/color-types';
  import type { OpticsStopName } from '../data/defaults';
  import '../../styles/button.css';
  import styles from './ComponentPreview.module.css';

  const TOKEN_PREFIX_MAP: Record<string, string> = {
    'primary': 'op-color-primary',
    'neutral': 'op-color-neutral',
    'danger': 'op-color-alerts-danger',
    'warning': 'op-color-alerts-warning',
    'notice': 'op-color-alerts-notice',
    'info': 'op-color-alerts-info',
    'secondary': 'op-color-secondary',
  };

  const STOPS: OpticsStopName[] = [
    'plus-max', 'plus-eight', 'plus-seven', 'plus-six', 'plus-five',
    'plus-four', 'plus-three', 'plus-two', 'plus-one', 'base',
    'minus-one', 'minus-two', 'minus-three', 'minus-four', 'minus-five',
    'minus-six', 'minus-seven', 'minus-eight', 'minus-max'
  ];

  $: cssVars = $colorTypes.colorTypes.reduce((acc, ct) => {
    if (!ct.enabled) return acc;
    
    const mode = $colorTypes.mode;
    const tokenPrefix = TOKEN_PREFIX_MAP[ct.id];
    
    if (!tokenPrefix) return acc;
    
    acc[`--${tokenPrefix}-h`] = `${ct.h}`;
    acc[`--${tokenPrefix}-s`] = `${ct.s}%`;
    
    STOPS.forEach(stop => {
      const bgL = mode === 'light' ? ct.lightBg[stop] : ct.darkBg[stop];
      const onL = mode === 'light' ? ct.lightOn[stop] : ct.darkOn[stop];
      const onAltL = mode === 'light' ? ct.lightOnAlt[stop] : ct.darkOnAlt[stop];
      
      acc[`--${tokenPrefix}-${stop}`] = `hsl(${ct.h} ${ct.s}% ${bgL}%)`;
      acc[`--${tokenPrefix}-on-${stop}`] = `hsl(${ct.h} ${ct.s}% ${onL}%)`;
      acc[`--${tokenPrefix}-on-${stop}-alt`] = `hsl(${ct.h} ${ct.s}% ${onAltL}%)`;
    });
    
    return acc;
  }, {} as Record<string, string>);

  $: styleString = Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
</script>

<div class={styles.preview} style={styleString}>
  <div class={styles.header}>
    <h2 class={styles.title}>Component Preview</h2>
    <p class={styles.subtitle}>See how Optics buttons look with your theme</p>
  </div>
  
  <div class={styles.section}>
    <h3 class={styles.sectionTitle}>Button Sizes</h3>
    <div class={styles.buttonGroup}>
      <button class="btn btn--small">Small</button>
      <button class="btn btn--medium">Medium</button>
      <button class="btn btn--large">Large</button>
    </div>
  </div>

  <div class={styles.section}>
    <h3 class={styles.sectionTitle}>Button Variants</h3>
    <div class={styles.buttonGrid}>
      <div class={styles.variantRow}>
        <span class={styles.variantLabel}>Default</span>
        <button class="btn">Button</button>
      </div>
      
      {#if $colorTypes.colorTypes.find(ct => ct.id === 'primary' && ct.enabled)}
        <div class={styles.variantRow}>
          <span class={styles.variantLabel}>Primary</span>
          <button class="btn btn--primary">Primary</button>
        </div>
      {/if}
      
      {#if $colorTypes.colorTypes.find(ct => ct.id === 'secondary' && ct.enabled)}
        <div class={styles.variantRow}>
          <span class={styles.variantLabel}>Secondary</span>
          <button class="btn btn--secondary">Secondary</button>
        </div>
      {/if}
      
      {#if $colorTypes.colorTypes.find(ct => ct.id === 'danger' && ct.enabled)}
        <div class={styles.variantRow}>
          <span class={styles.variantLabel}>Danger</span>
          <button class="btn btn--danger">Danger</button>
        </div>
      {/if}
      
      {#if $colorTypes.colorTypes.find(ct => ct.id === 'notice' && ct.enabled)}
        <div class={styles.variantRow}>
          <span class={styles.variantLabel}>Success</span>
          <button class="btn btn--notice">Success</button>
        </div>
      {/if}
      
      {#if $colorTypes.colorTypes.find(ct => ct.id === 'warning' && ct.enabled)}
        <div class={styles.variantRow}>
          <span class={styles.variantLabel}>Warning</span>
          <button class="btn btn--warning">Warning</button>
        </div>
      {/if}
      
      {#if $colorTypes.colorTypes.find(ct => ct.id === 'info' && ct.enabled)}
        <div class={styles.variantRow}>
          <span class={styles.variantLabel}>Info</span>
          <button class="btn btn--info">Info</button>
        </div>
      {/if}
    </div>
  </div>

  <div class={styles.section}>
    <h3 class={styles.sectionTitle}>Button States</h3>
    <div class={styles.buttonGroup}>
      <button class="btn btn--primary">Normal</button>
      <button class="btn btn--primary" disabled>Disabled</button>
    </div>
  </div>

  <div class={styles.section}>
    <h3 class={styles.sectionTitle}>Custom Color Types</h3>
    <div class={styles.buttonGrid}>
      {#each $colorTypes.colorTypes.filter(ct => ct.isCustom && ct.enabled) as customType}
        <div class={styles.variantRow}>
          <span class={styles.variantLabel}>{customType.name}</span>
          <button 
            class="btn"
            style="background-color: hsl({customType.h} {customType.s}% {$colorTypes.mode === 'light' ? customType.lightBg.base : customType.darkBg.base}%); box-shadow: inset 0 0 0 1px hsl({customType.h} {customType.s}% {$colorTypes.mode === 'light' ? customType.lightBg.base : customType.darkBg.base}%); color: hsl({customType.h} {customType.s}% {$colorTypes.mode === 'light' ? customType.lightOn.base : customType.darkOn.base}%);"
          >
            {customType.name}
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>
