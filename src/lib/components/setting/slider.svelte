<script module lang="ts">
  import type { ClassValue } from '$lib/utils';

  type Props = {
    id?: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    class?: ClassValue;
  };
</script>

<script lang="ts">
  import { cn } from '$lib/utils';

  let { class: className, min, max, value = $bindable((min + max) / 2), ...rest }: Props = $props();
</script>

<div class={cn('relative', className)}>
  <input
    type="range"
    bind:value
    {min}
    {max}
    {...rest}
    class="peer relative z-10 block w-full cursor-pointer opacity-0"
  />
  <span
    class="absolute top-1/2 left-0 h-0 w-full -translate-y-px border-y border-neutral-600 peer-hover:border-neutral-500 peer-active:border-neutral-500"
  ></span>
  <span
    class="absolute top-1/2 left-[calc(var(--value)*100%)] size-3 -translate-1/2 rounded-full border-2 border-neutral-500 bg-black transition-[scale] peer-hover:border-neutral-50 peer-active:scale-150 peer-active:border-neutral-50"
    style:--value={(value - min) / (max - min)}
  ></span>
</div>
