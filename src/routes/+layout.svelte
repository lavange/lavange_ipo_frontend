<script>
  //@ts-nocheck
  import "carbon-components-svelte/css/all.css";
  import Footer from "../components/Footer.svelte";
  import Header from "../components/Header.svelte";
  import { onMount } from "svelte";
  import { ToastNotification } from "carbon-components-svelte";
  import { notifications } from "../helper/notification_store";
  import { token } from "../helper/token_store";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { goto } from "$app/navigation";

  let theme = "g100"; // "white" | "g10" | "g80" | "g90" | "g100"

  const authenticateToken = async (token_) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(`${PUBLIC_API_URI}/authenticate`, requestOptions);

    const data = response.json();
    return data;
  };

  onMount(async () => {
    document.documentElement.setAttribute("theme", theme);

    const getToken = localStorage.getItem("token");
    if(getToken){
      const response = await authenticateToken(getToken);
      if(response && response.hasOwnProperty("status") && response["status"] === 200){
        token.set(getToken);
      }else {
        goto(`/login`, { replaceState: true });
      }
    }
  });
</script>

<div class="root">


<Header />
<slot />
<Footer />

<div class="notifications">
{#each $notifications as notification (notification)}
  <ToastNotification
    lowContrast
    kind="error"
    title="Error"
    subtitle="An internal server error occurred."
    caption={new Date().toLocaleString()}
  />
{/each}
</div>
</div>

<style lang="scss">
  :global(.flex) {
    display: flex;
  }

  :global(.justify-content-between) {
    justify-content: space-between;
  }

  .root {
    position: relative;
  }

  .notifications {
    position: fixed;
   right: 0;
    bottom: 0;
  }
</style>
