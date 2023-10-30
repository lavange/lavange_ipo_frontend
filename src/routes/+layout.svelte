<script>
  import "carbon-components-svelte/css/all.css";
  import Footer from "../components/Footer.svelte";
  import Header from "../components/Header.svelte";
  import { onMount } from "svelte";

  let theme = "g100"; // "white" | "g10" | "g80" | "g90" | "g100"

  onMount(() => {
    document.documentElement.setAttribute("theme", theme);
  });
</script>

<Header />
<slot />
<Footer />
