<script module lang="ts">
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  type Props = {
    f: number;
  };
</script>

<script lang="ts">
  let { f }: Props = $props();

  let note = $derived(Math.round(12 * Math.log2(f / 440) + 69));
  let name = $derived(notes[note % 12]);
  let n = $derived(name.charAt(0));
  let s = $derived(name.endsWith('#'));
  let o = $derived(Math.floor(note / 12) - 4);
</script>

{n}{#if s}<sup>#</sup>{/if}<sub>{o}</sub>
