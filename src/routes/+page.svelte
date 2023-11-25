<script>
  //@ts-nocheck
  import {
    Button,
    ClickableTile,
    Column,
    Content,
    Grid,
    ImageLoader,
    Loading,
    Row,
    Tab,
    TabContent,
    Tabs,
    TextInput,
    Tile,
    Truncate,
  } from "carbon-components-svelte";
  import { onMount, onDestroy } from "svelte";
  import { debounce, truncate } from "lodash";
  import { authenticate, formatCurrency } from "../helper/utils";
  import { AreaChart } from "@carbon/charts-svelte";
  import "@carbon/charts-svelte/styles.css";
  import { token } from "../helper/token_store";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { Repeat } from "carbon-icons-svelte";
  import * as idb from "idb";

  let ipos = null;
  let loading = true;
  let token_;
  let syncStatus = false;
  let stcg=15;
  let total_amount_invested = 0;
  let total_estimated_return = 0;

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

  async function initDB() {
    let db = await idb.openDB("lavange_ipo", 1, {
      upgrade(upgradeDB, oldVersion, newVersion, transaction, event) {
        upgradeDB.createObjectStore("applied_ipo", { keyPath: "id" });
      },
      blocked(currentVersion, blockedVersion, event) {},
      blocking(currentVersion, blockedVersion, event) {},
      terminated() {},
    });

    //db.createObjectStore("applied_ipo", { keyPath: "id" });
    db.close();
  }

  async function fetchAppliedIPO() {
    let db = await idb.openDB("lavange_ipo", 1);

    let tx = db.transaction("applied_ipo", "readonly");
    let store = tx.objectStore("applied_ipo");

    // add, clear, count, delete, get, getAll, getAllKeys, getKey, put
    let applied_ipos = await store.getAll();

    db.close();

    return applied_ipos;
  }

  const fetchIPO = async () => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(`${PUBLIC_API_URI}/ipo`, requestOptions);

    const data = response.json();
    loading = false;
    return data;
  };

  onMount(async () => {
    await token;
    if (!token_ ) {
      goto(`/login`, { replaceState: true });
      return;
    }

    const authenticated = await authenticate(token_)
    console.log(authenticated)
    if(!authenticated){
      goto(`/logout`, { replaceState: true });
      return;
    }

    const data = await fetchIPO();
    ipos = data["data"]["ipos"] ?? [];
    // ipos.sort((a, b) => {
    //   if (
    //     a.hasOwnProperty("biddingStartDate") &&
    //     b.hasOwnProperty("biddingStartDate")
    //   ) {
    //     let keyA = new Date(a.biddingStartDate);
    //     let keyB = new Date(b.biddingStartDate);
    //     return keyB - keyA;
    //   } else if (a.hasOwnProperty("biddingStartDate")) {
    //     return -1;
    //   } else if (b.hasOwnProperty("biddingStartDate")) {
    //     return 1;
    //   } else {
    //     return 0;
    //   }
    // });

    await initDB();
    const applied_ipos = await fetchAppliedIPO();

    ipos = ipos.map((ipo) => {
      let new_obj = {};
      delete Object.assign(new_obj, ipo, { ["id"]: ipo["_id"] })["_id"];
      new_obj["applied"] =
        applied_ipos.find((applied_ipo) => applied_ipo["id"] === ipo["_id"]) !==
        undefined
          ? applied_ipos.find((applied_ipo) => applied_ipo["id"] === ipo["_id"])
              .applied
          : false;
      return new_obj;
    });
  });

  let search_query = "";

  const filter = (val, query, selectedTab) => {
    let filtered_data = val ?? [];

    filtered_data = filtered_data.filter((ipo) => {
      if (selectedTab === 0) {
        if (
          ipo.hasOwnProperty("biddingStartDate") &&
          new Date(ipo.biddingStartDate) <= new Date()
        ) {
          return true;
        }
      } else if (selectedTab === 1) {
        if (
          ipo.hasOwnProperty("biddingStartDate") &&
          new Date(ipo.biddingStartDate) > new Date() || !ipo.hasOwnProperty("biddingStartDate")
        ) {
          return true;
        }
      }
      return false;
    });

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
  let selected = 0;
  $: {
    filteredIpos = filter(ipos, search_query, selected);
  }

  $: {
    calculatePnL(filteredIpos)
  }

  const calculatePnL = (ipo_list) => {
    total_amount_invested =  ipo_list.reduce((acc,curr)=>{
       return curr.applied ? acc + curr.minPrice * curr.minBidQuantity : acc;
    },0)

    total_estimated_return = ipo_list.reduce((acc,curr)=>{
       return curr.applied ? acc + (curr.gmps.length === 0 ? 0 : curr.gmps[0]["price"] * curr.minBidQuantity) : acc;
    },0)
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

  const syncIpo = async () => {
    syncStatus = true;
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const response = await fetch(
      `${PUBLIC_API_URI}/ipo/refresh`,
      requestOptions
    );

    syncStatus = false;
  };
</script>

<Content>
  {#if ipos === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}

  <div>
    <div>
      <h4>Total Amount Invested {formatCurrency(total_amount_invested)}</h4>
    </div>
    <div>
      <h4>
        Total Estimated Profit {
          formatCurrency(total_estimated_return)}
      </h4>
    </div>
    <div>
      <h4>
        Total Estimated Profit in % {((total_estimated_return /
          total_amount_invested) *
          100).toFixed(2)}
      </h4>
    </div>
    <div>
      <h4>
        Total Estimated Profit (after tax and commission) {formatCurrency(total_estimated_return - total_estimated_return * stcg/100)}
      </h4>
    </div>
    <div>
      <h4>
        Total Estimated Profit (after tax and commission) in % {((total_estimated_return - total_estimated_return * stcg/100 ) / total_amount_invested * 100).toFixed(2)}
      </h4>
    </div>
    <hr />
  </div>
    <Grid padding fullWidth>
      <Row>
        <Column sm={14} md={2} lg={14}>
          <TextInput bind:value={search_query} placeholder="Enter ipo name" />
        </Column>
        <Column sm={14} md={2} lg={2}>
          <Button
            size="small"
            icon={Repeat}
            iconDescription="Sync IPO"
            disabled={syncStatus}
            on:click={async () => {
              syncIpo();
            }}>IPO</Button
          >
        </Column>
      </Row>
      <Row>
        <Tabs type="container" bind:selected autoWidth>
          <Tab label="Ongoing" />
          <Tab label="Upcoming" />
          <svelte:fragment slot="content">
            <TabContent>
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
                          <span class="text--label">Estimated return </span><br
                          />{(
                            ((minBidQuantity * gmps[0]["price"]) /
                              (minPrice * minBidQuantity)) *
                            100
                          ).toFixed(2)}%
                        </p>
                        <p>
                          <span class="text--label">Total estimated return</span
                          ><br />{formatCurrency(
                            minBidQuantity * gmps[0]["price"]
                          )}
                        </p>
                        <p>
                          <span class="text--label">Total estimated return (after tax at {stcg}%)</span
                          ><br />{formatCurrency(
                            (minBidQuantity * gmps[0]["price"]) - ((minBidQuantity * gmps[0]["price"]) * (stcg/100))
                          )}
                        </p>
                      {/if}
                    </ClickableTile>
                  </Column>
                {/each}
              </Row>
            </TabContent>
            <TabContent>
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
                          <span class="text--label">Estimated return </span><br
                          />{(
                            ((minBidQuantity * gmps[0]["price"]) /
                              (minPrice * minBidQuantity)) *
                            100
                          ).toFixed(2)}%
                        </p>
                        <p>
                          <span class="text--label">Total estimated return</span
                          ><br />{formatCurrency(
                            minBidQuantity * gmps[0]["price"]
                          )}
                        </p>
                      {/if}
                    </ClickableTile>
                  </Column>
                {/each}
              </Row>
            </TabContent>
          </svelte:fragment>
        </Tabs>
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
