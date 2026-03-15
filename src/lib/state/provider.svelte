<script module lang="ts">
  import { createContext } from 'svelte';
  import { PitchDetector } from './pitchDetector.svelte.ts';

  const [usePitchDetector, registerPitchDetector] = createContext<PitchDetector>();

  export { usePitchDetector };
</script>

<script lang="ts">
  let { children } = $props();

  registerPitchDetector(new PitchDetector());
</script>

{@render children?.()}
