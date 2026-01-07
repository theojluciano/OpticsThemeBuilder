<script lang="ts">
  import { colorTypes } from '../stores/color-types';
  import { makeColor, getContrast } from '../utils/colors';
  import type { OpticsStopName } from '../data/defaults';
  import styles from './ColorStopCard.module.css';

  export let stop: OpticsStopName;
  export let colorTypeId: string;

  $: colorType = $colorTypes.colorTypes.find(ct => ct.id === colorTypeId);
  $: mode = $colorTypes.mode;
  
  $: bgValue = colorType && mode === 'light' 
    ? colorType.lightBg[stop] 
    : colorType?.darkBg[stop] ?? 0;
  
  $: onValue = colorType && mode === 'light' 
    ? colorType.lightOn[stop] 
    : colorType?.darkOn[stop] ?? 0;
  
  $: onAltValue = colorType && mode === 'light' 
    ? colorType.lightOnAlt[stop] 
    : colorType?.darkOnAlt[stop] ?? 0;

  $: h = colorType?.h ?? 0;
  $: s = colorType?.s ?? 0;

  $: bgColor = makeColor(h, s, bgValue);
  $: onColor = makeColor(h, s, onValue);
  $: onAltColor = makeColor(h, s, onAltValue);

  $: onContrast = getContrast(bgColor, onColor);
  $: onAltContrast = getContrast(bgColor, onAltColor);

  $: onPass = onContrast >= 4.5;
  $: onAltPass = onAltContrast >= 4.5;
  $: hasFailure = !onPass || !onAltPass;
  $: textColor = bgValue > 50 ? '#000' : '#fff';
</script>

<div class={`${styles.card} ${hasFailure ? styles.fail : ''}`}>
  <div class={styles.header}>
    <span class={styles.name}>{stop}</span>
    <span class={styles.lightness}>L: {bgValue}%</span>
  </div>
  
  <div class={styles.preview} style="background: {bgColor}; color: {textColor};">
    <div class={styles.hslDisplay}>
      <div>H: {Math.round(h)}°</div>
      <div>S: {Math.round(s)}%</div>
      <div>L: {bgValue}%</div>
    </div>
  </div>

  <div class={styles.sliderGroup}>
    <div class={styles.sliderLabel}>
      <span>Background</span>
      <span>{bgValue}%</span>
    </div>
    <input 
      type="range"
      class={styles.rangeInput}
      min="0" 
      max="100" 
      value={bgValue}
      on:input={(e) => colorTypes.updateBg(colorTypeId, stop, +e.currentTarget.value)}
    />
  </div>

  <div class={styles.sliderGroup}>
    <div class={styles.sliderLabel}>
      <span>On</span>
      <span>{onValue}%</span>
    </div>
    <input 
      type="range"
      class={styles.rangeInput}
      min="0" 
      max="100" 
      value={onValue}
      on:input={(e) => colorTypes.updateOn(colorTypeId, stop, +e.currentTarget.value)}
    />
  </div>

  <div class={styles.sliderGroup}>
    <div class={styles.sliderLabel}>
      <span>On-Alt</span>
      <span>{onAltValue}%</span>
    </div>
    <input 
      type="range"
      class={styles.rangeInput}
      min="0" 
      max="100" 
      value={onAltValue}
      on:input={(e) => colorTypes.updateOnAlt(colorTypeId, stop, +e.currentTarget.value)}
    />
  </div>

  <div class={styles.tests}>
    <div class={`${styles.test} ${onPass ? styles.pass : styles.fail}`}>
      <span>on (H:{Math.round(h)}° S:{Math.round(s)}% L:{onValue}%)</span>
      <span class={`${styles.value} ${onPass ? styles.pass : styles.fail}`}>
        {onContrast.toFixed(2)}:1
      </span>
    </div>
    <div class={`${styles.test} ${onAltPass ? styles.pass : styles.fail}`}>
      <span>on-alt (H:{Math.round(h)}° S:{Math.round(s)}% L:{onAltValue}%)</span>
      <span class={`${styles.value} ${onAltPass ? styles.pass : styles.fail}`}>
        {onAltContrast.toFixed(2)}:1
      </span>
    </div>
  </div>
</div>