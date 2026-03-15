<script lang="ts">
  import { slide } from 'svelte/transition';
  import { MainButton, Plot, Settings } from '$lib/components/ui';
  import { usePitchDetector } from '$lib/state';

  const detector = usePitchDetector();
</script>

<div
  class={[
    'relative flex grow flex-col items-center justify-center',
    'data-[active=true]:data-[above=true]:bg-green-300',
    'data-[active=true]:data-[above=false]:bg-red-400',
  ]}
  data-active={detector.active}
  data-above={detector.aboveThreshold}
>
  <Plot class="absolute top-0 left-0 size-full" />

  {#if !detector.active}
    <div class="relative z-10 w-full max-w-sm" transition:slide={{ axis: 'y', duration: 500 }}>
      <Settings class="pb-8" />
    </div>
  {/if}

  <MainButton class="relative z-10" />
</div>
