<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import styles from './PreviewButton.module.css';

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('click');
  }
</script>

<button class={styles.previewButton} on:click={handleClick}>
  <i class="ph-bold ph-eye"></i>
  Preview
</button>