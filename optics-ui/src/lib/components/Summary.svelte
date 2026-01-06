<script lang="ts">
  import { palette } from '../stores/palette';
  import { OPTICS_STOPS } from '../data/defaults';
  import { makeColor, getContrast } from '../utils/colors';
  import styles from './Summary.module.css';

  $: mode = $palette.mode;
  $: bgValues = mode === 'light' ? $palette.lightBg : $palette.darkBg;
  $: onValues = mode === 'light' ? $palette.lightOn : $palette.darkOn;
  $: onAltValues = mode === 'light' ? $palette.lightOnAlt : $palette.darkOnAlt;

  $: stats = OPTICS_STOPS.reduce((acc, stop) => {
    const bgColor = makeColor($palette.h, $palette.s, bgValues[stop]);
    const onColor = makeColor($palette.h, $palette.s, onValues[stop]);
    const onAltColor = makeColor($palette.h, $palette.s, onAltValues[stop]);
    
    const onContrast = getContrast(bgColor, onColor);
    const onAltContrast = getContrast(bgColor, onAltColor);
    
    if (onContrast >= 4.5) acc.pass++; else acc.fail++;
    if (onAltContrast >= 4.5) acc.pass++; else acc.fail++;
    
    return acc;
  }, { pass: 0, fail: 0 });

  $: total = stats.pass + stats.fail;
</script>

<div class={styles.summary}>
  <h3 class={styles.title}>Contrast Summary</h3>
  <div class={styles.stats}>
    <div class={styles.stat}>
      <div class="{styles.value} {styles.pass}">{stats.pass}</div>
      <div class={styles.label}>Passing</div>
    </div>
    <div class={styles.stat}>
      <div class="{styles.value} {styles.fail}">{stats.fail}</div>
      <div class={styles.label}>Failing</div>
    </div>
    <div class={styles.stat}>
      <div class={styles.value}>{total}</div>
      <div class={styles.label}>Total</div>
    </div>
  </div>
</div>


