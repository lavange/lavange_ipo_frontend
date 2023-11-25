<script>
  //@ts-nocheck
  import {
    ClickableTile,
    Column,
    Tile,
    Content,
    Grid,
    Loading,
    Row,
  } from "carbon-components-svelte";
  import { debounce, truncate } from "lodash";
  import { token } from "../helper/token_store";

  import * as idb from "idb";
  import { onMount } from "svelte";
  import {
    authenticate,
    formatCurrency,
    formatPercentage,
  } from "../helper/utils";

  let applied_ipos = [];
  let token_;
  let stcg = 15;
  let total_amount_invested = 0;
  let total_estimated_return = 0;

  const menu_items = [
    {
      id: "ipo",
      title: "IPO",
    },
    {
      id: "activity",
      title: "Activity",
    },
    {
      id: "user",
      title: "User",
    },
    {
      id: "calculator",
      title: "Calculator",
    },
  ];

  const FORMAT = {
    CURRENCY: "CURRENNCY",
    PERCENTAGE: "PERCENNTAGE",
    NUMBER: "NUMBER",
  };

  const format = (option) => {
    switch (option) {
      case FORMAT.CURRENCY:
        return formatCurrency;
      case FORMAT.PERCENTAGE:
        return formatPercentage;
      default:
        return (number) => number;
    }
  };

  let pnl_calculations = {
    total_amount_invested: {
      amount: 0,
      label: "Total Amount Invested",
      type: FORMAT.CURRENCY,
    },
    total_estimated_return: {
      amount: 0,
      label: "Total Estimated Profit ",
      type: FORMAT.CURRENCY,
      percentange: () => {
        return (
          (pnl_calculations.total_estimated_return.amount /
            pnl_calculations.total_amount_invested.amount) 
        );
      },
    },
    total_estimated_return_after_tax: {
      amount: 0,
      label: "Total Estimated Profit After Tax",
      type: FORMAT.CURRENCY,
      percentange: () => {
        return (
          ((pnl_calculations.total_estimated_return.amount -
            (pnl_calculations.total_estimated_return.amount * stcg) / 100) /
            pnl_calculations.total_amount_invested.amount) 
        );
      },
    },
  };

  token.subscribe((value) => {
    token_ = value;
  });

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

    await initDB();
    applied_ipos = await fetchAppliedIPO();
  });

  $: {
    calculatePnL(applied_ipos);
  }

  const calculatePnL = (ipo_list) => {
    pnl_calculations.total_amount_invested.amount = ipo_list.reduce(
      (acc, curr) => {
        return curr.applied ? acc + curr.minPrice * curr.minBidQuantity : acc;
      },
      0
    );

    pnl_calculations.total_estimated_return.amount = ipo_list.reduce(
      (acc, curr) => {
        return curr.applied
          ? acc +
              (curr.gmps.length === 0
                ? 0
                : curr.gmps[0]["price"] * curr.minBidQuantity)
          : acc;
      },
      0
    );

    pnl_calculations.total_estimated_return_after_tax.amount =
      pnl_calculations.total_estimated_return.amount -
      (pnl_calculations.total_estimated_return.amount * stcg) / 100;
  };
</script>

<Content>
  <!-- {#if ipos === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else} -->
  <Grid padding fullWidth>
    <Row>
      {#each Object.keys(pnl_calculations) as key}
        <Column sm={12} md={4} lg={4}>
          <Tile
            ><h3 use:truncate>{pnl_calculations[key].label}</h3>
            <h5>
              {format(pnl_calculations[key].type)(pnl_calculations[key].amount)}
            </h5>
            {#if pnl_calculations[key].hasOwnProperty("percentange")}
              <h5>
                {format(FORMAT.PERCENTAGE)(pnl_calculations[key].percentange())}
              </h5>
            {/if}
          </Tile>
        </Column>
      {/each}
    </Row>
    <hr />
    <Row>
      {#each menu_items as { id, title }}
        <Column sm={12} md={4} lg={4}>
          <ClickableTile href={`/${id}`}
            ><h3 use:truncate>{title}</h3>
            <p>Click Here</p>
          </ClickableTile>
        </Column>
      {/each}
    </Row>
  </Grid>
  <!-- {/if} -->
</Content>
