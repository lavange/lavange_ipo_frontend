<script>
  //@ts-nocheck
  import {
    Content,
    DataTable,
    Loading,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    ToolbarMenu,
    ToolbarMenuItem,
    Button,
    Pagination,
    Column,
    Tile,
    Row,
    Grid,
  } from "carbon-components-svelte";
  import { onMount, onDestroy } from "svelte";
  import { token } from "../../../helper/token_store";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { goto } from "$app/navigation";
  import {
    authenticate,
    formatCurrency,
    formatPercentage,
  } from "../../../helper/utils";
  import { truncate } from "lodash";

  let orders = [];
  let loading = true;
  let pageSize = 10;
  let page = 1;
  let selectedRowIds = [];
  let stcg = 15;
  let token_;
  let order_error = false;

  token.subscribe((value) => {
    token_ = value;
  });

  const OrderType = {
    MARKET: "MARKET",
    LIMIT: "LIMIT",
    STOP_LOSS: "STOP LOSS",
    GTT: "GTT",
  };

  const OrderStatus = {
    OPEN: "OPEN",
    FILLED: "FILLED",
    PARTIALLY_FILLED: "PARTIALLY FILLED",
    CANCELED: "CANCELED",
    EXPIRED: "EXPIRED",
    REJECTED: "REJECTED",
    PENDING_REVIEW: "PENDING REVIEW",
    TRIGGERED: "TRIGGERED",
    HELD: "HELD",
  };

  const TradeType = {
    BUY: "BUY",
    SELL: "SELL",
  };

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
      label: "Total Profit ",
      type: FORMAT.CURRENCY,
      percentange: () => {
        return (
          pnl_calculations.total_estimated_return.amount /
          pnl_calculations.total_amount_invested.amount
        );
      },
    },
    total_estimated_return_after_tax: {
      amount: 0,
      label: "Total Profit After Tax",
      type: FORMAT.CURRENCY,
      percentange: () => {
        return (
          (pnl_calculations.total_estimated_return.amount -
            (pnl_calculations.total_estimated_return.amount * stcg) / 100) /
          pnl_calculations.total_amount_invested.amount
        );
      },
    },
  };

  const fetchOrder = async () => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/order`, requestOptions);

    const data = response.json();
    loading = false;
    return data;
  };

  const handleRowClick = (row) => {
    goto(`/order/${row.detail.id}`);
  };

  const handleCreateClick = () => {
    goto(`/order/create`);
  };

  onMount(async () => {
    await token;
    if (!token_) {
      goto(`/login`, { replaceState: true });
    }

    const authenticated = await authenticate(token_);
    console.log(authenticated);
    if (!authenticated) {
      goto(`/logout`, { replaceState: true });
    }

    const data = await fetchOrder();
    orders = data["data"]["orders"] ?? [];
    orders = orders.map((order) => {
      let new_obj = {};
      delete Object.assign(new_obj, order, { ["id"]: order["_id"] })["_id"];
      return new_obj;
    });
    console.log(orders);
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
  });

  $: {
    calculatePnL(
      orders.filter((order) => {
        return selectedRowIds.includes(order.id);
      })
    );
  }

  const calculatePnL = (ipo_list) => {
    order_error =
      ipo_list.reduce((acc, curr) => {
        return curr.tradeType === TradeType.BUY ? curr.quantity + acc : acc;
      }, 0) -
      ipo_list.reduce((acc, curr) => {
        return curr.tradeType === TradeType.SELL ? curr.quantity + acc : acc;
      }, 0);

    pnl_calculations.total_amount_invested.amount = ipo_list.reduce(
      (acc, curr) => {
        return curr.tradeType === TradeType.BUY
          ? acc + curr.price * curr.quantity
          : acc;
      },
      0
    );

    pnl_calculations.total_estimated_return.amount =
      ipo_list.reduce((acc, curr) => {
        return curr.tradeType === TradeType.SELL
          ? acc + curr.price * curr.quantity
          : acc;
      }, 0) - pnl_calculations.total_amount_invested.amount;

    pnl_calculations.total_estimated_return_after_tax.amount =
      pnl_calculations.total_estimated_return.amount -
      (pnl_calculations.total_estimated_return.amount * stcg) / 100;
  };
</script>

<Content>
  {#if orders.length === 0 && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <Grid padding fullWidth>
      <Row>
        {#each Object.keys(pnl_calculations) as key}
          <Column sm={12} md={4} lg={4}>
            <Tile
              ><h3 use:truncate>{pnl_calculations[key].label}</h3>
              <h5>
                {format(pnl_calculations[key].type)(
                  pnl_calculations[key].amount
                )}
              </h5>
              {#if pnl_calculations[key].hasOwnProperty("percentange")}
                <h5>
                  {format(FORMAT.PERCENTAGE)(
                    pnl_calculations[key].percentange()
                  )}
                </h5>
              {/if}
            </Tile>
          </Column>
        {/each}
        <Column sm={12} md={4} lg={4}>
          <Tile
            ><h3 use:truncate>Order Check</h3>
            <h5>
              {order_error ? "Error Found!" : "NO Errors!"}
            </h5>
            <h5>
              Holding {order_error} Shares
            </h5>
          </Tile>
        </Column>
      </Row>
      <Row>
        <Column sm={16} md={4} lg={16}>
          <DataTable
            title="Order"
            description="Lavange ipo order list"
            sortable
            zebra
            selectable
            batchSelection
            bind:selectedRowIds
            headers={[
              { key: "id", value: "Id" },
              { key: "symbol", value: "Symbol" },
              { key: "tradeType", value: "Trade Type" },
              {
                key: "orderType",
                value: "Order Type",
                display: (orderType) => orderType.toUpperCase(),
              },
              { key: "quantity", value: "Quantity" },
              { key: "price", value: "Price" },
              { key: "orderStatus", value: "Order Status" },
              // {
              //   key: "timestamp",
              //   value: "Timestamp",
              //   display: (date) => new Date(date).toLocaleString(),
              //   //sort: (a, b) => new Date(b) - new Date(a),
              // },
              { key: "user.username", value: "User" },
              //{ key: "description", value: "Description" },
            ]}
            rows={orders}
            {page}
            {pageSize}
          >
            <Toolbar>
              <ToolbarContent>
                <ToolbarSearch persistent shouldFilterRows />
                <!-- <ToolbarMenu>
              <ToolbarMenuItem primaryFocus>Restart all</ToolbarMenuItem>
              <ToolbarMenuItem
                href="https://cloud.ibm.com/docs/loadbalancer-service"
              >
                API documentation
              </ToolbarMenuItem>
              <ToolbarMenuItem hasDivider danger>Stop all</ToolbarMenuItem>
            </ToolbarMenu> -->
                <!-- <Button on:click={handleCreateClick}>Create Order</Button> -->
              </ToolbarContent>
            </Toolbar>
          </DataTable>
          <Pagination
            bind:pageSize
            bind:page
            totalItems={orders.length}
            pageSizeInputDisabled
          />
        </Column>
      </Row>
    </Grid>
  {/if}
</Content>
