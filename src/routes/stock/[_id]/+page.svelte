<script>
  //@ts-nocheck
  import { page } from "$app/stores";
  import {
    Button,
    Checkbox,
    Content,
    Dropdown,
    Form,
    FormGroup,
    Grid,
    Link,
    Loading,
    Modal,
    NumberInput,
    Select,
    SelectItem,
    TextInput,
    Tooltip,
  } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import {
    authenticate,
    errorNotification,
    formatCurrency,
    formatDate,
    successNotification,
  } from "../../../helper/utils";
  import { AreaChart } from "@carbon/charts-svelte";
  import "@carbon/charts-svelte/styles.css";
  import WatsonHealthRotate_360 from "carbon-icons-svelte/lib/WatsonHealthRotate_360.svelte";
  import Repeat from "carbon-icons-svelte/lib/Repeat.svelte";
  import { Edit, Copy, List, TrashCan } from "carbon-icons-svelte";
  import { notifications } from "../../../helper/notification_store";
  import { keys, set, size } from "lodash";
  import { token } from "../../../helper/token_store";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { ProgressIndicator, ProgressStep } from "carbon-components-svelte";

  let stock = null;
  let default_stock = null;
  let loading = true;
  let stcg = 15;
  let token_;
  let edit_commission = false;
  let stock_id = "";

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
      mode: "cors",
    };

    const response = await fetch(
      `${PUBLIC_API_URI}/stock/${$page.params._id}`,
      requestOptions
    );

    const data = response.json();
    loading = false;
    return data;
  };

  const updateStock = async (stock_) => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var raw = JSON.stringify(stock_);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/stock`, requestOptions);
    const data = await response.json();
    loading = false;
    return data;
  };

  const deleteStock = async (stock_) => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    stock_['deleted'] = true;
    var raw = JSON.stringify(stock_);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/stock`, requestOptions);
    const data = await response.json();
    loading = false;
    return data;
  };

  const preFillForm = () => {
    stock = {
      _id: null,
      symbol: "",
    };

    default_stock = {
      _id: null,
      symbol: "",
    };
    loading = false;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    console.log("submit", e);

    const response = await updateStock(stock);

    if (response.status === 200) {
      goto(`/stock/${response["data"]["stock"]["_id"]}`, {
        replaceState: true,
      });
      stock_id = stock["_id"];
      successNotification("Stock Updated!");
    } else {
      errorNotification("Stock Update Failed!");
    }
  };

  const cancelUpdate = () => {
    stock_id = stock["_id"];
    stock = default_stock;
  };

  const handleDelete = async () => {

    const response = await deleteStock(stock);

    if (response.status === 200) {
      goto(`/stock`, {
        replaceState: true,
      });
      successNotification("Stock Deleted!");
    } else {
      errorNotification("Stock Deletion Failed!");
    }
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

    stock_id = $page.params._id;

    if (stock_id !== "create") {
      const data = await fetchStock();
      stock = data["data"]["stock"];
      default_stock = data["data"]["stock"];
      //edit_commission = stock.commission !== 0;
    }

    if (stock_id === "create") {
      preFillForm();
    }
  });

  //   $: {
  //     console.log(stock);
  //   }
</script>

<Content>
  {#if stock === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else if stock_id === "create" || stock_id === "update"}
    <div class="margin--bottom">
      <h1>Stock Form</h1>
      <hr />
    </div>
    <Form on:submit={submitForm}>
      <FormGroup>
        <TextInput
          id="symbol"
          placeholder="Enter Stock Symbol"
          bind:value={stock.symbol}
        />
      </FormGroup>
      <Button type="submit"
        >{stock_id === "create" ? "Create" : "Update"}</Button
      >
      {#if stock_id === "update"}
        <Button on:click={cancelUpdate}>Cancel</Button>{/if}
    </Form>
  {:else}
    <h1>
      {stock.symbol} Stock <Button
        on:click={() => navigator.clipboard.writeText(stock["symbol"])}
        iconDescription={stock["symbol"]}
        size="small"
        icon={Copy}
        kind="ghost"
      ></Button>
    </h1>
    <hr />
    <div class="margin--bottom">
      <div class="text--label">Symbol</div>
      <h2>{stock["symbol"]}</h2>
    </div>
    <Button
      icon={Edit}
      on:click={() => {
        stock_id = "update";
      }}>Edit</Button
    >

    <Button
      kind="danger"
      icon={TrashCan}
      on:click={handleDelete}>Delete</Button
    >
  {/if}
</Content>

<style lang="scss">
  .text--label {
    font-size: 1.25rem;
  }

  .margin--bottom {
    margin-bottom: 1rem;
  }
</style>
