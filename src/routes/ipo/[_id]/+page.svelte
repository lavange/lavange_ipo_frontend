<script>
  //@ts-nocheck
  import { page } from "$app/stores";
  import {
    Button,
    Content,
    Grid,
    Loading,
    Modal,
    TextInput,
  } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import { formatCurrency, formatDate } from "../../../helper/utils";
  import { AreaChart } from "@carbon/charts-svelte";
  import "@carbon/charts-svelte/styles.css";
  import WatsonHealthRotate_360 from "carbon-icons-svelte/lib/WatsonHealthRotate_360.svelte";
  import Repeat from "carbon-icons-svelte/lib/Repeat.svelte";
  import { Edit } from "carbon-icons-svelte";
  import { notifications } from "../../../helper/notification_store";
  import { set } from "lodash";
  import { token } from "../../../helper/token_store";
  import { goto } from "$app/navigation";
  import {PUBLIC_API_URI} from "$env/static/public";

  let ipo = null;
  let loading = true;
  let gmpKey = "";

  let token_;

  token.subscribe((value) => {
    token_ = value;
  });

  const options = {
    title: "Grey Market Premium Vs. Time",
    axes: {
      bottom: {
        mapsTo: "date",
        scaleType: "time",
        title: "Time",
      },
      left: {
        mapsTo: "value",
        scaleType: "linear",
        title: "Grey Market Premium",
      },
    },
    grid: false,
    curve: "curveNatural",
    height: "400px",
    theme: "g100",
  };

  const fetchIPO = async () => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(
      `${PUBLIC_API_URI}/api/ipo/${$page.params._id}`,
      requestOptions
    );

    const data = response.json();
    loading = false;
    return data;
  };

  onMount(async () => {
    await token;
    if (!token_) {
      goto(`/login`, { replaceState: true });
    }
    const data = await fetchIPO();
    ipo = data["data"]["ipo"];
    gmpKey = ipo["gmpKey"];
  });

  const formatData = (data) => {
    return data.map((item) => {
      return {
        group: ipo["name"],
        date: item["date"],
        value: item["price"],
      };
    });
  };

  let syncStatus = false;

  const syncGmp = async () => {
    syncStatus = true;
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(
      `${PUBLIC_API_URI}/api/gmp/refresh/${ipo["_id"]}`,
      requestOptions
    );

    syncStatus = false;
  };

  let open = false;

  const updateGMPKey = async () => {
    syncStatus = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var raw = JSON.stringify({
      _id: ipo["_id"],
      gmpKey: gmpKey,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(
      `${PUBLIC_API_URI}/api/ipo`,
      requestOptions
    );

    syncStatus = false;
  };
</script>

<Content>
  {#if ipo === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <div>
      <h1>{ipo["name"]}</h1>
    </div>
    <hr />
    <div>
      <Button
        on:click={() => (open = true)}
        size="small"
        icon={Edit}
        iconDescription="GMP Key"
        disabled={syncStatus}>GMP Key</Button
      >
      <Button
        size="small"
        icon={Repeat}
        iconDescription="Sync IPO"
        disabled={syncStatus}>IPO</Button
      >
      <Button
        size="small"
        icon={Repeat}
        iconDescription="Sync GMP"
        disabled={syncStatus}
        on:click={async () => {
          await syncGmp();
        }}>GMP</Button
      >
    </div>
    <hr />

    {#if ipo.hasOwnProperty("biddingStartDate")}
      <div>
        <div class="text--label">Bidding Start Date</div>
        <h2>{formatDate(ipo["biddingStartDate"])}</h2>
      </div>
    {/if}

    <div>
      <div class="text--label">Min.Investment</div>
      <h2>{formatCurrency(ipo["minPrice"] * ipo["minBidQuantity"])}</h2>
    </div>

    <div>
      <div class="text--label">Lot Size</div>
      <h2>{ipo["lotSize"]}</h2>
    </div>

    <hr />

    {#if ipo["gmps"].length > 0}
      <div>
        <div>
          <div class="text--label">Estimated return</div>
          <h2>
            {(
              ((ipo["minBidQuantity"] * ipo["gmps"][0]["price"]) /
                (ipo["minPrice"] * ipo["minBidQuantity"])) *
              100
            ).toFixed(2)}%
          </h2>
        </div>
        <div>
          <div class="text--label">Total estimated return</div>
          <h2>
            {formatCurrency(ipo["minBidQuantity"] * ipo["gmps"][0]["price"])}
          </h2>
        </div>
      </div>

      <AreaChart data={formatData(ipo["gmps"])} {options} />
    {/if}

    <Modal
      bind:open
      modalHeading="Edit GMP Key"
      primaryButtonText="Confirm"
      secondaryButtonText="Cancel"
      selectorPrimaryFocus="#gmp-key"
      on:click:button--secondary={() => (open = false)}
      on:open
      on:close
      on:submit={async () => {
        await updateGMPKey();
        notifications.update((items) => [...items, { name: "ok" }]);
        open = false;
      }}
    >
      <p>Update GMP Key</p>
      <br />
      <TextInput
        id="gmp-key"
        labelText="GMP Key"
        placeholder="Enter GMP Key"
        bind:value={gmpKey}
      />
    </Modal>
  {/if}
</Content>

<style lang="scss">
  .text--label {
    font-size: 1.25rem;
  }
</style>
