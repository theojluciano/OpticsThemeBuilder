<script lang="ts">
  import { colorTypes } from '../stores/color-types';
  import type { OpticsStopName } from '../data/defaults';
  import '../../styles/button.css';
  import '@rolemodel/optics/dist/css/components/form.css';
  import '../../styles/form-overrides.css';
  import styles from './FullPagePreview.module.css';

  export let isOpen = false;
  export let onClose: () => void;

  let previewMode: 'light' | 'dark' = $colorTypes.mode;

  function toggleMode() {
    previewMode = previewMode === 'light' ? 'dark' : 'light';
  }

  function getTokenPrefix(colorType: any): string {
    const prefixMap: Record<string, string> = {
      'primary': 'op-color-primary',
      'neutral': 'op-color-neutral',
      'danger': 'op-color-alerts-danger',
      'warning': 'op-color-alerts-warning',
      'notice': 'op-color-alerts-notice',
      'info': 'op-color-alerts-info',
      'secondary': 'op-color-secondary',
    };
    
    // For custom color types, create a token prefix from their name
    if (colorType.isCustom) {
      return `op-color-${colorType.name.toLowerCase().replace(/\s+/g, '-')}`;
    }
    
    return prefixMap[colorType.id] || '';
  }

  const STOPS: OpticsStopName[] = [
    'plus-max', 'plus-eight', 'plus-seven', 'plus-six', 'plus-five',
    'plus-four', 'plus-three', 'plus-two', 'plus-one', 'base',
    'minus-one', 'minus-two', 'minus-three', 'minus-four', 'minus-five',
    'minus-six', 'minus-seven', 'minus-eight', 'minus-max'
  ];

  $: cssVars = $colorTypes.colorTypes.reduce((acc, ct) => {
    if (!ct.enabled) return acc;
    
    const mode = previewMode;
    const tokenPrefix = getTokenPrefix(ct);
    
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
    
    // Add semantic color aliases for background and text colors (used by form components)
    if (ct.id === 'neutral') {
      const bgL = mode === 'light' ? ct.lightBg['plus-eight'] : ct.darkBg['plus-eight'];
      const onL = mode === 'light' ? ct.lightOn['plus-eight'] : ct.darkOn['plus-eight'];
      const onAltL = mode === 'light' ? ct.lightOnAlt['plus-eight'] : ct.darkOnAlt['plus-eight'];
      
      acc['--op-color-background'] = `hsl(${ct.h} ${ct.s}% ${bgL}%)`;
      acc['--op-color-on-background'] = `hsl(${ct.h} ${ct.s}% ${onL}%)`;
      acc['--op-color-on-background-alt'] = `hsl(${ct.h} ${ct.s}% ${onAltL}%)`;
    }
    
    // Generate input focus shadows dynamically for each color type
    if (ct.id === 'primary') {
      const plusTwoL = mode === 'light' ? ct.lightBg['plus-two'] : ct.darkBg['plus-two'];
      const plusFiveL = mode === 'light' ? ct.lightBg['plus-five'] : ct.darkBg['plus-five'];
      acc['--op-input-focus-primary'] = `inset 0 0 0 var(--op-border-width-large) hsl(${ct.h} ${ct.s}% ${plusTwoL}%), 0 0 0 var(--op-border-width-x-large) hsl(${ct.h} ${ct.s}% ${plusFiveL}%)`;
    }
    
    if (ct.id === 'secondary') {
      const plusTwoL = mode === 'light' ? ct.lightBg['plus-two'] : ct.darkBg['plus-two'];
      const plusFiveL = mode === 'light' ? ct.lightBg['plus-five'] : ct.darkBg['plus-five'];
      acc['--op-input-focus-secondary'] = `inset 0 0 0 var(--op-border-width-large) hsl(${ct.h} ${ct.s}% ${plusTwoL}%), 0 0 0 var(--op-border-width-x-large) hsl(${ct.h} ${ct.s}% ${plusFiveL}%)`;
    }
    
    if (ct.id === 'danger') {
      const plusTwoL = mode === 'light' ? ct.lightBg['plus-two'] : ct.darkBg['plus-two'];
      const plusFiveL = mode === 'light' ? ct.lightBg['plus-five'] : ct.darkBg['plus-five'];
      acc['--op-input-focus-danger'] = `inset 0 0 0 var(--op-border-width-large) hsl(${ct.h} ${ct.s}% ${plusTwoL}%), 0 0 0 var(--op-border-width-x-large) hsl(${ct.h} ${ct.s}% ${plusFiveL}%)`;
    }
    
    if (ct.id === 'warning') {
      const plusTwoL = mode === 'light' ? ct.lightBg['plus-two'] : ct.darkBg['plus-two'];
      const plusFiveL = mode === 'light' ? ct.lightBg['plus-five'] : ct.darkBg['plus-five'];
      acc['--op-input-focus-warning'] = `inset 0 0 0 var(--op-border-width-large) hsl(${ct.h} ${ct.s}% ${plusTwoL}%), 0 0 0 var(--op-border-width-x-large) hsl(${ct.h} ${ct.s}% ${plusFiveL}%)`;
    }
    
    if (ct.id === 'notice') {
      const plusTwoL = mode === 'light' ? ct.lightBg['plus-two'] : ct.darkBg['plus-two'];
      const plusFiveL = mode === 'light' ? ct.lightBg['plus-five'] : ct.darkBg['plus-five'];
      acc['--op-input-focus-notice'] = `inset 0 0 0 var(--op-border-width-large) hsl(${ct.h} ${ct.s}% ${plusTwoL}%), 0 0 0 var(--op-border-width-x-large) hsl(${ct.h} ${ct.s}% ${plusFiveL}%)`;
    }
    
    if (ct.id === 'info') {
      const plusTwoL = mode === 'light' ? ct.lightBg['plus-two'] : ct.darkBg['plus-two'];
      const plusFiveL = mode === 'light' ? ct.lightBg['plus-five'] : ct.darkBg['plus-five'];
      acc['--op-input-focus-info'] = `inset 0 0 0 var(--op-border-width-large) hsl(${ct.h} ${ct.s}% ${plusTwoL}%), 0 0 0 var(--op-border-width-x-large) hsl(${ct.h} ${ct.s}% ${plusFiveL}%)`;
    }
    
    return acc;
  }, {} as Record<string, string>);

  $: styleString = Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class={styles.backdrop} on:click={handleBackdropClick} role="presentation">
    <div class={styles.modal} data-mode={previewMode}>
      <div class={styles.modalHeader}>
        <h2 class={styles.modalTitle}>Component Preview</h2>
        <div style="display: flex; gap: 12px; align-items: center;">
          <button 
            class={styles.closeButton} 
            on:click={toggleMode} 
            aria-label="Toggle {previewMode === 'light' ? 'dark' : 'light'} mode"
            title="Switch to {previewMode === 'light' ? 'dark' : 'light'} mode"
          >
            {#if previewMode === 'light'}
              <i class="ph-bold ph-moon"></i>
            {:else}
              <i class="ph-bold ph-sun"></i>
            {/if}
          </button>
          <button class={styles.closeButton} on:click={onClose} aria-label="Close preview">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>
      </div>
      
      <div class={styles.modalContent}>
        <div class={styles.preview} data-mode={previewMode} style={styleString}>

  <!-- Buttons - Primary -->
  <div class={styles.card}>
    <h3 class={styles.cardTitle}>Buttons · Primary</h3>
    <div class={styles.cardContent}>
      <div class="btn btn--primary" style="width: 100%; pointer-events: none;">Default</div>
      <div class="btn btn--primary" style="width: 100%; pointer-events: none; background-color: var(--op-color-primary-plus-one); box-shadow: inset var(--op-border-all) var(--op-color-primary-plus-one); color: var(--op-color-primary-on-plus-one);">Hover</div>
      <div class="btn btn--primary" style="width: 100%; pointer-events: none; background-color: var(--op-color-primary-base); box-shadow: var(--op-input-focus-primary); color: var(--op-color-primary-on-base);">Focus</div>
      <div class="btn btn--primary" style="width: 100%; pointer-events: none; opacity: var(--op-opacity-disabled);">Disabled</div>
    </div>
  </div>

  <!-- Buttons - No Border -->
  <div class={styles.card}>
    <h3 class={styles.cardTitle}>Buttons · Default</h3>
    <div class={styles.cardContent}>
      <div class="btn btn--no-border" style="width: 100%; pointer-events: none;">Default</div>
      <div class="btn btn--no-border" style="width: 100%; pointer-events: none; background-color: var(--op-color-primary-plus-eight); box-shadow: inset var(--op-border-all) var(--op-color-primary-plus-five); color: var(--op-color-primary-on-plus-eight);">Hover</div>
      <div class="btn btn--no-border" style="width: 100%; pointer-events: none; background-color: var(--op-color-primary-plus-eight); box-shadow: var(--op-input-focus-primary); color: var(--op-color-primary-on-plus-eight);">Focus</div>
      <div class="btn btn--no-border" style="width: 100%; pointer-events: none; opacity: var(--op-opacity-disabled);">Disabled</div>
    </div>
  </div>

  <!-- Button Sizes -->
  <div class={styles.card}>
    <h3 class={styles.cardTitle}>Button Sizes</h3>
    <div class={styles.cardContent}>
      <button class="btn btn--primary btn--small" style="width: 100%;">Small</button>
      <button class="btn btn--primary btn--medium" style="width: 100%;">Medium</button>
      <button class="btn btn--primary btn--large" style="width: 100%;">Large</button>
    </div>
  </div>

  <!-- Button Variants -->
  <div class={`${styles.card} ${styles.fullWidth}`}>
    <h3 class={styles.cardTitle}>Button Variants</h3>
    <div class={styles.cardContent}>
      <div class={styles.buttonGroup}>
        <button class="btn">Default</button>
        
        {#if $colorTypes.colorTypes.find(ct => ct.id === 'primary' && ct.enabled)}
          <button class="btn btn--primary">Primary</button>
        {/if}
        
        {#if $colorTypes.colorTypes.find(ct => ct.id === 'danger' && ct.enabled)}
          <button class="btn btn--destructive">Destructive</button>
        {/if}
        
        {#if $colorTypes.colorTypes.find(ct => ct.id === 'warning' && ct.enabled)}
          <button class="btn btn--warning">Warning</button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Form Inputs -->
  <div class={`${styles.card} ${styles.fullWidth}`}>
    <h3 class={styles.cardTitle}>Form Inputs</h3>
    <div class={styles.cardContent}>
      <div class={styles.formGrid}>
        <div class="form-group">
          <label class="form-label" for="email-input">
            Email Address
          </label>
          <input 
            id="email-input"
            type="email"
            class="form-control"
            placeholder="you@example.com"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label" for="name-input">
            Full Name
          </label>
          <input 
            id="name-input"
            type="text"
            class="form-control"
            placeholder="Enter your name"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label" for="priority-select">
            Priority Level
          </label>
          <select 
            id="priority-select"
            class="form-control"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="disabled-input">
            Disabled Input
          </label>
          <input 
            id="disabled-input"
            type="text"
            class="form-control"
            placeholder="This input is disabled"
            disabled
          />
        </div>
      </div>
      
      <div class={styles.formGridFullWidth}>
        <div class="form-group">
          <label class="form-label" for="message-textarea">
            Message
          </label>
          <textarea 
            id="message-textarea"
            class="form-control"
            placeholder="Tell us what you think..."
            rows="4"
          ></textarea>
        </div>
      </div>
    </div>
  </div>

  <!-- Form Validation States -->
  <div class={`${styles.card} ${styles.fullWidth}`}>
    <h3 class={styles.cardTitle}>Form Validation States</h3>
    <div class={styles.cardContent}>
      <div class={styles.formGrid}>
        <div class="form-group form-group--error">
          <label class="form-label" for="error-input">
            Error State
          </label>
          <input 
            id="error-input"
            type="text"
            class="form-control"
            placeholder="This field has an error"
            value="invalid@"
          />
          <span class="form-error">
            Please enter a valid email address
          </span>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="warning-input">
            Warning State
          </label>
          <input 
            id="warning-input"
            type="text"
            class="form-control"
            placeholder="This field has a warning"
            value="test"
          />
          <span class="form-hint">
            Password is weak. Consider using a stronger password.
          </span>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="success-input">
            Success State
          </label>
          <input 
            id="success-input"
            type="text"
            class="form-control"
            placeholder="This field is valid"
            value="john@example.com"
          />
          <span class="form-hint">
            Email address is valid and available
          </span>
        </div>
      </div>
    </div>
  </div>


        </div>
      </div>
    </div>
  </div>
{/if}
