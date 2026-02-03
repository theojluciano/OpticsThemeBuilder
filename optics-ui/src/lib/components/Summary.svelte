<script lang="ts">
  import { palette } from '../stores/palette';
  import { OPTICS_STOPS } from '../data/defaults';
  import { calculateContrastStats } from '../utils/contrast-stats';
  import styles from './Summary.module.css';

  $: mode = $palette.mode;
  $: bgValues = mode === 'light' ? $palette.lightBg : $palette.darkBg;
  $: onValues = mode === 'light' ? $palette.lightOn : $palette.darkOn;
  $: onAltValues = mode === 'light' ? $palette.lightOnAlt : $palette.darkOnAlt;

  $: stats = calculateContrastStats(
    OPTICS_STOPS,
    $palette.h,
    $palette.s,
    bgValues,
    onValues,
    onAltValues
  );

  $: total = stats.aaa + stats.aa + stats.fail;
</script>

<div class={styles.summary}>
  <h3 class={styles.title}>Contrast Summary</h3>
  <div class={styles.stats}>
    <div class={styles.stat}>
      <div class="{styles.value} {styles.pass}">{stats.aaa}</div>
      <div class={styles.label}>AAA Pass</div>
    </div>
    <div class={styles.stat}>
      <div class="{styles.value} {styles.aa}">{stats.aa}</div>
      <div class={styles.label}>AA Only</div>
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