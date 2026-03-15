<script lang="ts">
  import Icon, { type IconProps } from './icon.svelte';

  let { ...rest }: IconProps = $props();
</script>

<Icon {...rest}>
  <path
    d="M 7.75 5 c 0 -1.7 1.5 -2 3 -1 s 11 7.7 13 9 s 2 2.7 0 4 s -11.5 8 -13 9 s -3 0.7 -3 -1 z"
  />
</Icon>
