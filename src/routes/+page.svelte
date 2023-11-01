<script>
  //@ts-nocheck
  import {
    ClickableTile,
    Column,
    Content,
    Grid,
    ImageLoader,
    Loading,
    Row,
    TextInput,
    Tile,
    Truncate,
  } from "carbon-components-svelte";
  import { onMount, onDestroy } from "svelte";
  import { debounce, truncate } from "lodash";
  import { formatCurrency } from "../helper/utils";
  import { AreaChart } from "@carbon/charts-svelte";
  import "@carbon/charts-svelte/styles.css";
  import { token } from "../helper/token_store";
  import { goto } from "$app/navigation";

  let ipos = null;
  let loading = true;
  let token_;

  token.subscribe((value) => {
    token_ = value;
  });

  const options = {
    axes: {
      bottom: {
        mapsTo: "date",
        scaleType: "time",
        visible: false,
      },
      left: {
        mapsTo: "value",
        scaleType: "linear",
        visible: false,
      },
    },
    curve: "curveNatural",
    height: "200px",
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
      "http://192.168.79.183:3132/api/ipo",
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
    ipos = data["ipos"] ?? [];
    ipos.sort((a, b) => {
      if (
        a.hasOwnProperty("biddingStartDate") &&
        b.hasOwnProperty("biddingStartDate")
      ) {
        let keyA = new Date(a.biddingStartDate);
        let keyB = new Date(b.biddingStartDate);
        return keyB - keyA;
      } else if (a.hasOwnProperty("biddingStartDate")) {
        return -1;
      } else if (b.hasOwnProperty("biddingStartDate")) {
        return 1;
      } else {
        return 0;
      }
    });
  });

  let search_query = "";

  const filter = (val, query) => {
    let filtered_data = val ?? [];

    if (query !== "") {
      filtered_data = filtered_data.filter((ipo) =>
        ipo["name"].toLowerCase().includes(query.toLowerCase())
      );
    }
    return filtered_data;
  };

  //const debouncedFilter = debounce(filter, 250);

  // Use the debounced filter function in the UI.
  let filteredIpos = [];
  $: {
    filteredIpos = filter(ipos, search_query);
  }

  const formatData = (data) => {
    return data.map((item) => {
      return {
        group: "g1",
        date: item["date"],
        value: item["price"],
      };
    });
  };
</script>

<Content>
  {#if ipos === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <Grid padding fullWidth>
      <Row>
        <Column>
          <TextInput bind:value={search_query} placeholder="Enter ipo name" />
        </Column>
      </Row>
      <Row>
        {#each filteredIpos as { _id, name, minPrice, minBidQuantity, logoUrl, symbol, seoName, gmps }}
          <Column sm={12} md={4} lg={4}>
            <ClickableTile
              href={`/ipo/${_id}`}
              light={minPrice * minBidQuantity < 15001 &&
                minPrice * minBidQuantity > 0}
              ><h3 use:truncate>{name}</h3>
              <p>
                <span class="text--label">Min. Investment</span><br />
                {formatCurrency(minPrice * minBidQuantity)}
              </p>
              <!-- <div class="tile--img">
                <ImageLoader src={logoUrl}  />
               </div> -->
              {#if gmps.length > 0}
                <!-- <AreaChart data={formatData(gmps)} {options}  /> -->
                <p>
                  <span class="text--label">Estimated return </span><br />{(
                    ((minBidQuantity * gmps[0]["price"]) /
                      (minPrice * minBidQuantity)) *
                    100
                  ).toFixed(2)}%
                </p>
                <p>
                  <span class="text--label">Total estimated return</span><br
                  />{formatCurrency(minBidQuantity * gmps[0]["price"])}
                </p>
              {/if}
            </ClickableTile>
          </Column>
        {/each}
      </Row>
    </Grid>
  {/if}
</Content>

<style lang="scss">
  .tile {
  }

  .tile--img {
    width: 50px;
  }

  .text--label {
    font-size: 0.8rem;
  }
</style>
