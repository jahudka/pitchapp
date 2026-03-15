<script module lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from '$lib/utils';

  export type IconProps = {
    class?: ClassValue;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { cn } from '$lib/utils';

  let { class: className, children }: IconProps = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 30 30"
  class={cn('inline-block aspect-square w-4', className)}
  stroke="currentColor"
  fill="currentColor"
  fill-rule="evenodd"
>
  {@render children?.()}
</svg>
