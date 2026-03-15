<script module lang="ts">
  import type { ClassValue } from '$lib/utils';

  type Props = {
    class?: ClassValue;
  };
</script>

<script lang="ts">
  import { Button } from '$lib/components/button';
  import { PlayIcon, StopIcon } from '$lib/components/icons';
  import { usePitchDetector } from '$lib/state';
  import { cn } from '$lib/utils';

  const detector = usePitchDetector();
  let { class: className }: Props = $props();
  let disabled = $state(false);

  async function onclick(): Promise<void> {
    disabled = true;

    if (detector.active) {
      await detector.stop();
    } else {
      await detector.start();
    }

    disabled = false;
  }
</script>

<Button class={cn('p-8', className)} data-active={detector.active} {disabled} {onclick}>
  {#if detector.active}
    <StopIcon class="size-24" />
  {:else}
    <PlayIcon class="size-24" />
  {/if}
</Button>
