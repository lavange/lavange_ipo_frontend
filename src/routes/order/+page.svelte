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
  } from "carbon-components-svelte";
  import { onMount, onDestroy } from "svelte";
  import { token } from "../../helper/token_store";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { goto } from "$app/navigation";
  import { authenticate } from "../../helper/utils";

  let orders = null;
  let loading = true;

  let token_;

  token.subscribe((value) => {
    token_ = value;
  });

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

  const handleCreateClick = ()=>{
    goto(`/order/create`);
  }

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
</script>

<Content>
  {#if orders === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <DataTable
      title="Order"
      description="Lavange ipo order list"
      sortable
      zebra
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
      on:click:row={handleRowClick}
    >
      <Toolbar>
        <ToolbarContent>
          <ToolbarSearch />
          <!-- <ToolbarMenu>
            <ToolbarMenuItem primaryFocus>Restart all</ToolbarMenuItem>
            <ToolbarMenuItem
              href="https://cloud.ibm.com/docs/loadbalancer-service"
            >
              API documentation
            </ToolbarMenuItem>
            <ToolbarMenuItem hasDivider danger>Stop all</ToolbarMenuItem>
          </ToolbarMenu> -->
          <Button on:click={handleCreateClick}>Create Order</Button>
        </ToolbarContent>
      </Toolbar>
    </DataTable>
  {/if}
</Content>
