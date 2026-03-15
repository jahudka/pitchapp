<script lang="ts">
  import Icon, { type IconProps } from './icon.svelte';

  let { ...rest }: IconProps = $props();
</script>

<Icon {...rest}>
  <path
    d="M 5 7 c 0 -1 1 -2 2 -2 s 15 0 16 0 s 2 1 2 2 s 0 15 0 16 s -1 2 -2 2 s -15 0 -16 0 s -2 -1 -2 -2 z"
  />
</Icon>
