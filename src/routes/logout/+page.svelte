<script>
  //@ts-nocheck
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { token } from "../../helper/token_store";

  onMount(() => {
    token.update(() => null);
    localStorage.removeItem("token", null);
    goto("/login", { replaceState: true });
  });
</script>
