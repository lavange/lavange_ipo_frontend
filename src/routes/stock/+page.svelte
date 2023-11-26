<script>
    //@ts-nocheck
    import { Content, DataTable, Loading } from "carbon-components-svelte";
    import { onMount, onDestroy } from "svelte";
    import { token } from "../../helper/token_store";
    import { PUBLIC_API_URI } from "$env/static/public";
    import { goto } from "$app/navigation";
    import { authenticate } from "../../helper/utils";
  
    let stocks = null;
    let loading = true;
  
    let token_;
  
    token.subscribe((value) => {
      token_ = value;
    });
  
    const fetchStock = async () => {
      loading = true;
      var myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token_}`);
  
      var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        mode: 'cors'
      };
  
      const response = await fetch(`${PUBLIC_API_URI}/stock`, requestOptions);
  
      const data = response.json();
      loading = false;
      return data;
    };
  
    onMount(async () => {
      await token;
      if (!token_) {
        goto(`/login`, { replaceState: true });
      }
  
      const authenticated = await authenticate(token_)
      console.log(authenticated)
      if(!authenticated){
        goto(`/logout`, { replaceState: true });
      }
  
      const data = await fetchStock();
      stocks = data["data"]["stocks"] ?? [];
      stocks = stocks.map((stock) => {
        let new_obj = {};
        delete Object.assign(new_obj, stock, { ["id"]: stock["_id"] })[
          "_id"
        ];
        return new_obj;
      });
      console.log(stocks);
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
    {#if stocks === null && loading === false}
      Nothing to show!
    {:else if loading === true}
      <Loading />
    {:else}
      <DataTable
      title="Stock"
    description="Lavange ipo stock list"
        sortable
        headers={[
          { key: "id", value: "Stock Id"},
          { key: "symbol", value: "Symbol" },
        ]}
        rows={stocks}
      />
    {/if}
  </Content>
  