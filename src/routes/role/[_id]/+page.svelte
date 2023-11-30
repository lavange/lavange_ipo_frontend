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
  import { RightType } from "../../../helper/constants";
  import * as jwt from "jsonwebtoken-esm";

  let role = null;
  let userRights = [];
  let default_role = null;
  let loading = true;
  let stcg = 15;
  let token_;
  let edit_commission = false;
  let role_id = "";
  let rights = Object.values(RightType).map((right) => {
    return {
      id: right,
      right: right,
      applied: false,
    };
  });

  token.subscribe((value) => {
    token_ = value;
  });

  const fetchRole = async () => {
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
      `${PUBLIC_API_URI}/role/${$page.params._id}`,
      requestOptions
    );

    const data = response.json();
    loading = false;
    return data;
  };

  const updateRole = async (role_) => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var raw = JSON.stringify(role_);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/role`, requestOptions);
    const data = await response.json();
    loading = false;
    return data;
  };

  const deleteRole = async (role_) => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token_}`);

    role_["deleted"] = true;
    var raw = JSON.stringify(role_);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/role`, requestOptions);
    const data = await response.json();
    loading = false;
    return data;
  };

  const preFillForm = () => {
    role = {
      _id: null,
      name: "",
      rights: [],
    };

    default_role = {
      _id: null,
      name: "",
      rights: [],
    };
    loading = false;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    console.log("submit", e);

    role['rights'] = rights.filter((right_)=>right_.applied).map((right_)=>right_.right);
    const response = await updateRole(role);

    if (response.status === 200) {
      goto(`/role/${response["data"]["role"]["_id"]}`, {
        replaceState: true,
      });
      role_id = role["_id"];
      successNotification("Role Updated!");
    } else {
      errorNotification("Role Update Failed!");
    }
  };

  const cancelUpdate = () => {
    role_id = role["_id"];
    role = default_role;
  };

  const handleDelete = async () => {
    const response = await deleteRole(role);

    if (response.status === 200) {
      goto(`/role`, {
        replaceState: true,
      });
      successNotification("Role Deleted!");
    } else {
      errorNotification("Role Deletion Failed!");
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

    let decodedToken = await jwt.decode(token_, {
      complete: true,
    });

    userRights = await decodedToken.payload.role.rights;

    role_id = $page.params._id;

    if (role_id !== "create") {
      const data = await fetchRole();
      role = data["data"]["role"];
      default_role = data["data"]["role"];
      //edit_commission = role.commission !== 0;
      role["rights"].forEach((right_)=>{
        let right = rights.find((right__)=>right__.right == right_);
        right.applied = true;
      })
    }

    if (role_id === "create") {
      preFillForm();
    }
  });

  //   $: {
  //     console.log(role);
  //   }
</script>

<Content>
  {#if role === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else if role_id === "create" || role_id === "update"}
    <div class="margin--bottom">
      <h1>Role Form</h1>
      <hr />
    </div>
    <Form on:submit={submitForm}>
      <FormGroup>
        <TextInput
          id="name"
          placeholder="Enter Role Name"
          bind:value={role.name}
        />
      </FormGroup>
      <FormGroup legendText="Select the applied IPOs from the Ongoing IPOs">
        <!--{ _id, name, maxPrice, minBidQuantity, logoUrl, symbol, seoName, gmps, applied }-->
        {#each rights as right_ ((right_.id, right_.applied, right_.right))}
          <Checkbox
            id={right_.id}
            labelText={right_.right}
            bind:checked={right_.applied}
          />
        {/each}
      </FormGroup>
      <Button type="submit">{role_id === "create" ? "Create" : "Update"}</Button
      >
      {#if role_id === "update"}
        <Button on:click={cancelUpdate}>Cancel</Button>{/if}
    </Form>
  {:else}
    <h1>
      {role._id} Role <Button
        on:click={() => navigator.clipboard.writeText(role["_id"])}
        iconDescription={role["_id"]}
        size="small"
        icon={Copy}
        kind="ghost"
      ></Button>
    </h1>
    <hr />
    <div class="margin--bottom">
      <div class="text--label">Name</div>
      <h2>{role["name"]}</h2>
    </div>
    <div class="margin--bottom">
      <div class="text--label">Rights</div>
      <UnorderedList>
        {#each role["rights"] as right}
          <ListItem>{right}</ListItem>
        {/each}
      </UnorderedList>
    </div>
    <Button
      icon={Edit}
      on:click={() => {
        role_id = "update";
      }}
      disabled={!hasRight(RightType.UPDATE_ROLE, userRights)}>Edit</Button
    >

    <Button
      kind="danger"
      icon={TrashCan}
      disabled={!hasRight(RightType.UPDATE_ROLE, userRights)}
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
