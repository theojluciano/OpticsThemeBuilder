<script lang="ts">
  import { palette } from '../stores/palette';
  import { OPTICS_STOPS } from '../data/defaults';
  import { makeColor, getContrast } from '../utils/colors';

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

<div class="summary">
  <h3>Contrast Summary</h3>
  <div class="stats">
    <div class="stat">
      <div class="value pass">{stats.pass}</div>
      <div class="label">Passing</div>
    </div>
    <div class="stat">
      <div class="value fail">{stats.fail}</div>
      <div class="label">Failing</div>
    </div>
    <div class="stat">
      <div class="value">{total}</div>
      <div class="label">Total</div>
    </div>
  </div>
</div>

<style>
  .summary {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  h3 {
    color: #e5e5e5;
    margin-bottom: 15px;
    font-size: 18px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .stat {
    background: #0f0f0f;
    padding: 15px;
    border-radius: 6px;
    text-align: center;
  }

  .value {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 4px;
    color: #e5e5e5;
  }

  .value.pass {
    color: #10b981;
  }

  .value.fail {
    color: #ef4444;
  }

  .label {
    color: #888;
    font-size: 13px;
  }
</style>
