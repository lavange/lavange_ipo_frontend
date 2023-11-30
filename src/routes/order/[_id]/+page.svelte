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
    formatCurrency,
    formatDate,
  } from "../../../helper/utils";
  import { AreaChart } from "@carbon/charts-svelte";
  import "@carbon/charts-svelte/styles.css";
  import WatsonHealthRotate_360 from "carbon-icons-svelte/lib/WatsonHealthRotate_360.svelte";
  import Repeat from "carbon-icons-svelte/lib/Repeat.svelte";
  import { Edit, Copy, List } from "carbon-icons-svelte";
  import { notifications } from "../../../helper/notification_store";
  import { keys, set, size } from "lodash";
  import { token } from "../../../helper/token_store";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { ProgressIndicator, ProgressStep } from "carbon-components-svelte";

  let order = null;
  let users = [];
  let stocks = [];
  let loading = true;
  let stcg = 15;
  let token_;
  let edit_commission = false;

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

    const response = await fetch(
      `${PUBLIC_API_URI}/order/${$page.params._id}`,
      requestOptions
    );

    const data = response.json();
    loading = false;
    return data;
  };

  const fetchUser = async () => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/user`, requestOptions);

    const data = response.json();
    loading = false;
    return data;
  };

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

    const response = await fetch(`${PUBLIC_API_URI}/stock`, requestOptions);

    const data = response.json();
    loading = false;
    return data;
  };

  const updateOrder = async (order_) => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var raw = JSON.stringify(order_);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/order`, requestOptions);
    const data = await response.json();
    loading = false;
    return data;
  };

  const preFillForm = () => {
    order = {
      _id: null,
      orderStatus: OrderStatus.FILLED,
      orderType: OrderType.MARKET,
      price: 0,
      quantity: 0,
      symbol: "",
      tradeType: TradeType.BUY,
      user: "",
      commission: 0,
    };

    loading = false;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    console.log("submit", e);

    const response = await updateOrder(order);

    if (response.status === 200) {
      goto(`/order/${response["data"]["order"]["_id"]}`, {
        replaceState: true,
      });
    }
  };

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

    if ($page.params._id !== "create") {
      const data = await fetchOrder();
      let processed_data = data["data"]["order"];
      processed_data["user"] = processed_data["user"]["_id"];
      order = processed_data;

      edit_commission = order.commission !== 0;
    }

    if ($page.params._id === "create") {
      preFillForm();
    }

    const data = await fetchUser();
    users = data["data"]["users"] ?? [];
    users = users.map((user) => {
      let new_obj = {};
      delete Object.assign(new_obj, user, { ["id"]: user["_id"] })["_id"];
      return new_obj;
    });

    const data_ = await fetchStock();
    stocks = data_["data"]["stocks"] ?? [];
  });

  const formatData = (data) => {
    return data.map((item) => {
      return {
        group: order["name"],
        date: item["date"],
        value: item["price"],
      };
    });
  };
</script>

<Content>
  {#if order === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <Form on:submit={submitForm}>
      <FormGroup legendText="">
        <Select
          id="symbol"
          labelText="Symbol"
          selected={order["symbol"] ? stocks[0] : "" }
          on:change={(e) => (order["symbol"] = e.target.value)}
        >
          {#each stocks as { symbol }}
            <SelectItem value={symbol} text={symbol} />
          {/each}
        </Select>

        <!-- <Dropdown
      titleText="Contact"
      selectedId={users.length ? users[0]['id'] : null}
      items={users.map((user)=>{ return {id: user["id"] ,text: user["username"] }})}
    /> -->
      </FormGroup>

      <!-- <FormGroup>
        <TextInput labelText="Symbol" bind:value={order.symbol} />
      </FormGroup> -->
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
      <FormGroup legendText="">
        <Select
          id="tradeType"
          labelText="Trade Type"
          selected={order["tradeType"] }
          on:change={(e) => (order["tradeType"] = e.target.value)}
        >
          {#each Object.keys(TradeType) as tradeType}
            <SelectItem value={tradeType} text={tradeType} />
          {/each}
        </Select>
      </FormGroup>
      <FormGroup legendText="">
        <Select
          id="orderType"
          labelText="Order Type"
          selected={order["orderType"]}
          on:change={(e) => (order["orderType"] = e.target.value)}
        >
          {#each Object.keys(OrderType) as orderType}
            <SelectItem value={orderType} text={orderType} />
          {/each}
        </Select>
      </FormGroup>
      <FormGroup legendText="">
        <Select
          id="orderStatus"
          labelText="Order Status"
          selected={order["orderStatus"]}
          on:change={(e) => (order["orderStatus"] = e.target.value)}
        >
          {#each Object.keys(OrderStatus) as orderStatus}
            <SelectItem value={orderStatus} text={orderStatus} />
          {/each}
        </Select>
      </FormGroup>
      <FormGroup>
        <NumberInput label="Price" step={0.01} bind:value={order.price} />
      </FormGroup>
      <FormGroup>
        <NumberInput label="Quantity" bind:value={order.quantity} />
      </FormGroup>
      <FormGroup legendText="">
        <Select
          id="user"
          labelText="User"
          selected={order["user"] ? users[0].id : ""}
          on:change={(e) => (order["user"] = e.target.value)}
        >
          {#each users as { username, id }}
            <SelectItem value={id} text={username} />
          {/each}
        </Select>

        <!-- <Dropdown
  titleText="Contact"
  selectedId={users.length ? users[0]['id'] : null}
  items={users.map((user)=>{ return {id: user["id"] ,text: user["username"] }})}
/> -->
      </FormGroup>
      <FormGroup>
        {#if !edit_commission}
          <div class="margin--bottom">
            <h5>Commission Hierarchy</h5>
            <ul>
              <li>Order Commission is applied if non-zero.</li>
              <li>If Order commission is zero, IPO Commission is applied.</li>
              <li>If IPO Commission is zero, User Commission is applied.</li>
              <li>
                If User Commission is zero, optional Group Commission is
                applied.
              </li>
              <li>Skip types with zero commission values.</li>
              <li>
                Group Commission is applied only if no prior commission has been
                applied.
              </li>
            </ul>
          </div>
          <div class="margin--bottom">
            <a href="/policy">Learn more.</a>
          </div>
          <Button
            size="small"
            on:click={() => {
              edit_commission = true;
            }}>Apply</Button
          >
        {:else}
          <div class="margin--bottom">
            <NumberInput label="Commission" step={0.01}  bind:value={order.commission} />
          </div>
          <Button
            size="small"
            on:click={() => {
              edit_commission = false;
              order.commission = 0;
            }}>Cancel</Button
          >
        {/if}
      </FormGroup>
      <Button type="submit"
        >{$page.params._id === "create" ? "Create" : "Update"}</Button
      >
    </Form>
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
