<script lang="ts">
  import { palette } from '../stores/palette';
  import { makeColor, getContrast } from '../utils/colors';
  import type { OpticsStopName } from '../data/defaults';

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

<div class="card" class:fail={hasFailure}>
  <div class="header">
    <span class="name">{stop}</span>
    <span class="lightness">L: {bgValue}%</span>
  </div>
  
  <div class="preview" style="background: {bgColor}; color: {textColor};">
    <div class="hsl-display">
      <div>H: {Math.round($palette.h)}°</div>
      <div>S: {Math.round($palette.s)}%</div>
      <div>L: {bgValue}%</div>
    </div>
  </div>

  <div class="slider-group">
    <div class="slider-label">
      <span>Background</span>
      <span>{bgValue}%</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={bgValue}
      on:input={(e) => palette.updateBg(stop, +e.currentTarget.value)}
    />
  </div>

  <div class="slider-group">
    <div class="slider-label">
      <span>On</span>
      <span>{onValue}%</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={onValue}
      on:input={(e) => palette.updateOn(stop, +e.currentTarget.value)}
    />
  </div>

  <div class="slider-group">
    <div class="slider-label">
      <span>On-Alt</span>
      <span>{onAltValue}%</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={onAltValue}
      on:input={(e) => palette.updateOnAlt(stop, +e.currentTarget.value)}
    />
  </div>

  <div class="tests">
    <div class="test" class:pass={onPass} class:fail={!onPass}>
      <span>on (H:{Math.round($palette.h)}° S:{Math.round($palette.s)}% L:{onValue}%)</span>
      <span class="value" class:pass={onPass} class:fail={!onPass}>
        {onContrast.toFixed(2)}:1
      </span>
    </div>
    <div class="test" class:pass={onAltPass} class:fail={!onAltPass}>
      <span>on-alt (H:{Math.round($palette.h)}° S:{Math.round($palette.s)}% L:{onAltValue}%)</span>
      <span class="value" class:pass={onAltPass} class:fail={!onAltPass}>
        {onAltContrast.toFixed(2)}:1
      </span>
    </div>
  </div>
</div>

<style>
  .card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 15px;
  }

  .card.fail {
    border-color: #ef4444;
  }

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #333;
  }

  .name {
    font-weight: 600;
    color: #e5e5e5;
  }

  .lightness {
    font-size: 13px;
    color: #888;
  }

  .preview {
    height: 80px;
    border-radius: 6px;
    margin-bottom: 12px;
    border: 1px solid #444;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
  }

  .hsl-display {
    display: flex;
    gap: 12px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 12px;
  }

  .slider-group {
    margin-bottom: 10px;
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #888;
    margin-bottom: 4px;
  }

  input[type="range"] {
    width: 100%;
    height: 6px;
    background: #333;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #3b82f6;
    cursor: pointer;
    border-radius: 50%;
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #3b82f6;
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }

  .tests {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .test {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    background: #0f0f0f;
    border-radius: 4px;
    font-size: 13px;
  }

  .test.pass {
    border-left: 3px solid #10b981;
  }

  .test.fail {
    border-left: 3px solid #ef4444;
  }

  .value.pass {
    color: #10b981;
    font-weight: 600;
  }

  .value.fail {
    color: #ef4444;
    font-weight: 600;
  }
</style>
