<script lang="ts">
  import { palette } from '../stores/palette';
  import { makeColor, getContrast } from '../utils/colors';
  import type { OpticsStopName } from '../data/defaults';
  import styles from './ColorStopCard.module.css';

  export let stop: OpticsStopName;

  $: mode = $palette.mode;
  $: bgValue = mode === 'light' ? $palette.lightBg[stop] : $palette.darkBg[stop];
  $: onValue = mode === 'light' ? $palette.lightOn[stop] : $palette.darkOn[stop];
  $: onAltValue = mode === 'light' ? $palette.lightOnAlt[stop] : $palette.darkOnAlt[stop];

  $: bgColor = makeColor($palette.h, $palette.s, bgValue);
  $: onColor = makeColor($palette.h, $palette.s, onValue);
  $: onAltColor = makeColor($palette.h, $palette.s, onAltValue);

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
      <div>H: {Math.round($palette.h)}°</div>
      <div>S: {Math.round($palette.s)}%</div>
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
      on:input={(e) => palette.updateBg(stop, +e.currentTarget.value)}
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
      on:input={(e) => palette.updateOn(stop, +e.currentTarget.value)}
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
      on:input={(e) => palette.updateOnAlt(stop, +e.currentTarget.value)}
    />
  </div>

  <div class={styles.tests}>
    <div class={`${styles.test} ${onPass ? styles.pass : styles.fail}`}>
      <span>on (H:{Math.round($palette.h)}° S:{Math.round($palette.s)}% L:{onValue}%)</span>
      <span class={`${styles.value} ${onPass ? styles.pass : styles.fail}`}>
        {onContrast.toFixed(2)}:1
      </span>
    </div>
    <div class={`${styles.test} ${onAltPass ? styles.pass : styles.fail}`}>
      <span>on-alt (H:{Math.round($palette.h)}° S:{Math.round($palette.s)}% L:{onAltValue}%)</span>
      <span class={`${styles.value} ${onAltPass ? styles.pass : styles.fail}`}>
        {onAltContrast.toFixed(2)}:1
      </span>
    </div>
  </div>
</div>
