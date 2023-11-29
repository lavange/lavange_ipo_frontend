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
    FileUploaderButton,
    FileUploader,
    Pagination,
  } from "carbon-components-svelte";
  import { onMount, onDestroy } from "svelte";
  import { token } from "../../../helper/token_store";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { goto } from "$app/navigation";
  import { authenticate } from "../../../helper/utils";
  import Papa from "papaparse";
  import ObjectID  from 'bson-objectid';

  let stocks = null;
  let headers = null;
  let loading = true;

  let fileUploader;
  let files = [];

  let token_;

  let pageSize = 20;
  let page = 1;

  token.subscribe((value) => {
    token_ = value;
  });

  const updateStock = async (stocks_) => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var raw = JSON.stringify({stocks:stocks_});

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/stock/bulk`, requestOptions);
    const data = await response.json();
    loading = false;
    return data;
  };

  const handleCreateClick = () => {
    goto(`/stock/create`);
  };

  const processFile = async () => {
    const parse = Papa.parse(files[0], {
      header: true,
      complete: (results) => {
        headers = results.meta.fields;
        stocks = results.data.map((item) => {
          return {
            id: item[headers[0]],
            _id: ObjectID().toHexString(),
            ...item,
          };
        });
        headers = results.meta.fields;
      },
    });
  };

  const handleProceed = () => {
    processFile();
  };

  const handleUpload = async () => {
    await updateStock(stocks);
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

    loading = false;

    // const data = await fetchStock();
    // stocks = data["data"]["stocks"] ?? [];
    // stocks = stocks.map((stock) => {
    //   let new_obj = {};
    //   delete Object.assign(new_obj, stock, { ["id"]: stock["_id"] })["_id"];
    //   return new_obj;
    // });
    // console.log(stocks);
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
  {#if loading === true}
    <Loading />
  {:else}
    <h1>Upload Stock Symbol</h1>
    <hr />
    <FileUploader
      bind:this={fileUploader}
      labelTitle="Upload file"
      buttonLabel="Add file"
      labelDescription="Only CSV files are accepted."
      accept={[".csv"]}
      status="complete"
      bind:files
    />

    <Button
      kind="tertiary"
      disabled={!files.length}
      on:click={() => (files = [])}
    >
      Clear Files
    </Button>

    <Button disabled={files.length === 0} on:click={handleProceed}
      >Proceed</Button
    >

    {#if stocks}
      <DataTable
        title="Stock"
        description="Lavange ipo stock list"
        sortable
        headers={headers.map((item) => {
          return {
            key: item,
            value: item.trim(),
          };
        })}
        rows={stocks}
        {pageSize}
        {page}
      >
        <Toolbar>
          <ToolbarContent>
            <ToolbarSearch />

            <Button on:click={handleCreateClick}>Create Stock</Button>
          </ToolbarContent>
        </Toolbar>
      </DataTable>
      <Pagination
        bind:pageSize
        bind:page
        totalItems={stocks.length}
        pageSizeInputDisabled
      />

      <Button disabled={stocks.length === 0} on:click={handleUpload}
      >Upload</Button
    >
    {/if}
  {/if}
</Content>
