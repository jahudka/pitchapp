<script module lang="ts">
  import type { ClassValue } from '$lib/utils';

  type Props = {
    class?: ClassValue;
  };
</script>

<script lang="ts">
  import { Setting } from '$lib/components/setting';
  import { FMAX, FMIN, usePitchDetector } from '$lib/state';
  import { cn } from '$lib/utils';
  import Note from './note.svelte';

  const detector = usePitchDetector();
  let { class: className }: Props = $props();
</script>

<div class={cn('flex flex-col gap-4 px-8 text-center', className)}>
  <Setting label="Target frequency:" min={FMIN} max={FMAX} bind:value={detector.threshold}>
    {detector.threshold} Hz
    <span class="font-normal text-neutral-400">/</span>
    <Note f={detector.threshold} />
  </Setting>
  <Setting label="Time window:" min={1} max={10} bind:value={detector.window}>
    {detector.window}s
  </Setting>
</div>
