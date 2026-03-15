<script module lang="ts">
  import type { ClassValue } from '$lib/utils';

  type Props = {
    class?: ClassValue;
  };
</script>

<script lang="ts">
  import { FMAX, FMIN, usePitchDetector } from '$lib/state';

  const detector = usePitchDetector();
  let { class: className }: Props = $props();
  let canvas: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = $derived(canvas?.getContext('2d') ?? null);
  let width: number = $derived((window.devicePixelRatio ?? 1) * (canvas?.offsetWidth ?? 0));
  let height: number = $derived((window.devicePixelRatio ?? 1) * (canvas?.offsetHeight ?? 0));
  let x = 0;

  $effect(() => {
    if (!canvas || !ctx || detector.average === undefined) {
      return;
    }

    if (x === 0) {
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#07f';
    }

    const v = (detector.average - FMIN) / (FMAX - FMIN);
    const y = height * (1 - v);
    ctx.beginPath();
    ctx.moveTo(x - 1, y);
    ctx.arc(x, y, 3, 0, 360);
    ctx.fill();

    if (++x >= width) {
      x = 0;
    }
  });
</script>

<canvas bind:this={canvas} class={className}></canvas>
