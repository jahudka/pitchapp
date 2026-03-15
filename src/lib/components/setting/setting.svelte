<script module lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    child?: Snippet<[value: number]>;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import Slider from './slider.svelte';

  const id = $props.id();
  let { label, value = $bindable(), child, children, ...rest }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  <label for={`setting-${id}`} class="text-neutral-400">{label}</label>
  <span class="text-2xl font-bold tabular-nums">
    {#if child}
      {@render child(value)}
    {:else if children}
      {@render children()}
    {:else}
      {value}
    {/if}
  </span>
  <Slider bind:value {...rest} />
</div>
