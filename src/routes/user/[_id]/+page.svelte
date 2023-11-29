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
    ListItem,
    Loading,
    Modal,
    NumberInput,
    Select,
    SelectItem,
    TextInput,
    Tooltip,
    UnorderedList,
  } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import {
    authenticate,
    errorNotification,
    formatCurrency,
    formatDate,
    hasRight,
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
  import * as jwt from "jsonwebtoken-esm";
  import { RightType } from "../../../helper/constants";

  let user = null;
  let default_user = null;
  let loading = true;
  let stcg = 15;
  let token_;
  let edit_commission = false;
  let user_id = "";
  let rights = [];

  token.subscribe((value) => {
    token_ = value;
  });

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

    const response = await fetch(
      `${PUBLIC_API_URI}/user/${$page.params._id}`,
      requestOptions
    );

    const data = response.json();
    loading = false;
    return data;
  };

  const updateUser = async (user_) => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var raw = JSON.stringify(user_);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/user`, requestOptions);
    const data = await response.json();
    loading = false;
    return data;
  };

  const deleteUser = async (user_) => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    user_["deleted"] = true;
    var raw = JSON.stringify(user_);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/user`, requestOptions);
    const data = await response.json();
    loading = false;
    return data;
  };

  const preFillForm = () => {
    user = {
      _id: null,
      symbol: "",
    };

    default_user = {
      _id: null,
      symbol: "",
    };
    loading = false;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    console.log("submit", e);

    const response = await updateUser(user);

    if (response.status === 200) {
      goto(`/user/${response["data"]["user"]["_id"]}`, {
        replaceState: true,
      });
      user_id = user["_id"];
      successNotification("User Updated!");
    } else {
      errorNotification("User Update Failed!");
    }
  };

  const cancelUpdate = () => {
    user_id = user["_id"];
    user = default_user;
  };

  const handleDelete = async () => {
    const response = await deleteUser(user);

    if (response.status === 200) {
      goto(`/user`, {
        replaceState: true,
      });
      successNotification("User Deleted!");
    } else {
      errorNotification("User Deletion Failed!");
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

    user_id = $page.params._id;

    if (user_id !== "create") {
      const data = await fetchUser();
      user = data["data"]["user"];
      default_user = data["data"]["user"];
      //edit_commission = user.commission !== 0;
    }

    if (user_id === "create") {
      preFillForm();
    }

    let decodedToken = await jwt.decode(token_, {
      complete: true,
    });


    rights = await decodedToken.payload.role.rights;
  });

  //   $: {
  //     console.log(user);
  //   }
</script>

<Content>
  {#if user === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else if user_id === "create" || user_id === "update"}
    <!-- <div class="margin--bottom">
      <h1>User Form</h1>
      <hr />
    </div>
    <Form on:submit={submitForm}>
      <FormGroup>
        <TextInput
          id="symbol"
          placeholder="Enter User Symbol"
          bind:value={user.symbol}
        />
      </FormGroup>
      <FormGroup>
        <TextInput
          id="name"
          placeholder="Enter Company Name"
          bind:value={user.name}
        />
      </FormGroup>
      <FormGroup>
        <TextInput id="isin" placeholder="Enter ISIN" bind:value={user.isin} />
      </FormGroup>
      <Button type="submit">{user_id === "create" ? "Create" : "Update"}</Button
      >
      {#if user_id === "update"}
        <Button on:click={cancelUpdate}>Cancel</Button>{/if}
    </Form> -->
  {:else}
    <h1>
      User {user._id}<Button
        on:click={() => navigator.clipboard.writeText(user["_id"])}
        iconDescription={user["_id"]}
        size="small"
        icon={Copy}
        kind="ghost"
      ></Button>
    </h1>
    <hr />
    <div class="margin--bottom">
      <div class="text--label">Username</div>
      <h2>{user["username"]}<Button
        on:click={() => navigator.clipboard.writeText(user["username"])}
        iconDescription={user["username"]}
        size="small"
        icon={Copy}
        kind="ghost"
      ></Button></h2>
    </div>
    <div class="margin--bottom">
      <div class="text--label">First Name</div>
      <h2>{user["firstName"]}</h2>
    </div>
    <div class="margin--bottom">
      <div class="text--label">Last Name</div>
      <h2>{user["lastName"]}</h2>
    </div>
    <div class="margin--bottom">
      <div class="text--label">Email</div>
      <h2>{user["email"]}<Button
        on:click={() => navigator.clipboard.writeText(user["email"])}
        iconDescription={user["email"]}
        size="small"
        icon={Copy}
        kind="ghost"
      ></Button></h2>
    </div>
    <div class="margin--bottom">
      <div class="text--label">Role</div>
      <h2>{user["role"]["name"]}</h2>
    </div>
    <div class="margin--bottom">
      <div class="text--label">Rights</div>
      <UnorderedList>
        {#each user["role"]["rights"] as right}
          <ListItem>{right}</ListItem>
        {/each}
      </UnorderedList>
    </div>
    <div class="margin--bottom">
      <div class="text--label">Account</div>
      <h2>{user["account"]["_id"]}<Button
        on:click={() => navigator.clipboard.writeText(user["account"]["_id"])}
        iconDescription={user["account"]["_id"]}
        size="small"
        icon={Copy}
        kind="ghost"
      ></Button></h2>
      <h2>{user["account"]["balance"]}</h2>
    </div>
    <Button
      icon={Edit}
      on:click={() => {
        user_id = "update";
      }}
      disabled={!hasRight(RightType.UPDATE_USER ,rights)}
      >Edit</Button
    >

    <Button kind="danger" icon={TrashCan} on:click={handleDelete} disabled={!hasRight(RightType.DELETE_USER,rights)}>Delete</Button
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
