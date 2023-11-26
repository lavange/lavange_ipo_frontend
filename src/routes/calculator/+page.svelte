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
    Form,
    FormGroup,
    Checkbox,
    RadioButtonGroup,
    RadioButton,
    Select,
    SelectItem,
    NumberInput,
  } from "carbon-components-svelte";

  import { onMount, onDestroy } from "svelte";
  import { debounce, truncate } from "lodash";
  import { authenticate, formatCurrency } from "../../helper/utils";
  import { AreaChart } from "@carbon/charts-svelte";
  import "@carbon/charts-svelte/styles.css";
  import { token } from "../../helper/token_store";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { Repeat } from "carbon-icons-svelte";
  import * as idb from "idb";

  let ipos = null;
  let loading = true;
  let token_;
  let syncStatus = false;
  let stcg = 15;

  let total_amount_invested = 0;
  let total_estimated_return = 0;
  //let total_estimated_profit_after_tax = 0;

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
      mode: 'cors'
    };

    const response = await fetch(`${PUBLIC_API_URI}/ipo`, requestOptions);

    const data = response.json();
    loading = false;
    return data;
  };

  async function updateAppliedIPO(applied_ipos_) {
    let db = await idb.openDB("lavange_ipo", 1, (upgradeDB) =>
      upgradeDB.createObjectStore("applied_ipo", { keyPath: "id" })
    );

    let tx = db.transaction("applied_ipo", "readwrite");
    let store = tx.objectStore("applied_ipo");

    applied_ipos_.forEach(async (applied_ipo_) => {
      await store.put(applied_ipo_);
    });

    await tx.complete;
    db.close();
  }

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

  onMount(async () => {
    await token;
    if (!token_) {
      goto(`/login`, { replaceState: true });
      return;
    }

    const authenticated = await authenticate(token_);
    console.log(authenticated);
    if (!authenticated) {
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
          (ipo.hasOwnProperty("biddingStartDate") &&
            new Date(ipo.biddingStartDate) > new Date()) ||
          !ipo.hasOwnProperty("biddingStartDate")
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
    calculatePnL(filteredIpos);
  }

  const calculatePnL = (ipo_list) => {
    total_amount_invested =  ipo_list.reduce((acc,curr)=>{
       return curr.applied ? acc + curr.maxPrice * curr.minBidQuantity : acc;
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
      mode: 'cors'
    };

    const response = await fetch(
      `${PUBLIC_API_URI}/ipo/refresh`,
      requestOptions
    );

    syncStatus = false;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    console.log("submit", e);

    const selectedAppliedIpos = filteredIpos.filter(
      (checkbox) => checkbox.applied
    );

    // Log or process the selected checkboxes
    console.log(selectedAppliedIpos);

    await updateAppliedIPO(filteredIpos);
  };
</script>

<Content>
  {#if ipos === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <div>
      <!-- <Row>
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
        </Row> -->
      <div>
        <div>
          <h1>IPO PnL Calculator</h1>
        </div>
        <hr />
      </div>
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
      <div>
        <Form on:submit={submitForm}>
          <FormGroup legendText="Select the applied IPOs from the Ongoing IPOs">
            <!--{ _id, name, maxPrice, minBidQuantity, logoUrl, symbol, seoName, gmps, applied }-->
            {#each filteredIpos as ipo ((ipo.id, ipo.applied, ipo.name))}
              <Checkbox
                id={ipo.id}
                labelText={ipo.name}
                bind:checked={ipo.applied}
              />
            {/each}
          </FormGroup>
          <!-- <FormGroup legendText="Radio buttons">
            <RadioButtonGroup
              name="radio-button-group"
              selected="default-selected"
            >
              <RadioButton
                id="radio-1"
                value="standard"
                labelText="Standard Radio Button"
              />
              <RadioButton
                id="radio-2"
                value="default-selected"
                labelText="Default Selected Radio Button"
              />
              <RadioButton
                id="radio-4"
                value="disabled"
                labelText="Disabled Radio Button"
                disabled
              />
            </RadioButtonGroup>
          </FormGroup> -->
          <!-- <FormGroup>
            <Select id="select-1" labelText="Select menu">
              <SelectItem
                disabled
                hidden
                value="placeholder-item"
                text="Choose an option"
              />
              <SelectItem value="option-1" text="Option 1" />
              <SelectItem value="option-2" text="Option 2" />
              <SelectItem value="option-3" text="Option 3" />
            </Select>
          </FormGroup> -->
          <FormGroup
            legendText="Enter the total sum of percentage of STCG(Short Term Capital Gains Tax) , commission and other charges"
          >
            <NumberInput id="tax" value={30} />
          </FormGroup>
          <Button type="submit">Update</Button>
        </Form>
      </div>
    </div>
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
