<script>
  //@ts-nocheck
  import {
    Content,
    DataTable,
    Loading,
    Pagination,
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
  import { authenticate, hasRight } from "../../helper/utils";
  import { RightType } from "../../helper/constants";
  import * as jwt from "jsonwebtoken-esm";

  let users = null;
  let loading = true;
  let pageSize = 10;
  let page = 1;
  let userRights = [];

  let token_;

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

    const response = await fetch(`${PUBLIC_API_URI}/user`, requestOptions);

    const data = response.json();
    loading = false;
    return data;
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

    let decodedToken = await jwt.decode(token_, {
      complete: true,
    });

    userRights = await decodedToken.payload.role.rights;

    const data = await fetchUser();
    users = data["data"]["users"] ?? [];
    users = users.map((user) => {
      let new_obj = {};
      delete Object.assign(new_obj, user, { ["id"]: user["_id"] })["_id"];
      return new_obj;
    });
    console.log(users);
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

  const handleRowClick = (row) => {
    goto(`/user/${row.detail.id}`);
  };

  const handleCreateClick = () => {
    goto(`/user/create`);
  };
</script>

<Content>
  {#if users === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <DataTable
      title="User"
      description="Lavange ipo user list"
      sortable
      headers={[
        { key: "id", value: "User Id" },
        // {
        //   key: "timestamp",
        //   value: "Timestamp",
        //   display: (date) => new Date(date).toLocaleString(),
        //   //sort: (a, b) => new Date(b) - new Date(a),
        // },
        { key: "username", value: "Username" },
        { key: "email", value: "Email" },
        { key: "firstName", value: "First Name" },
        { key: "lastName", value: "Last Name" },
        { key: "role.name", value: "Role" },
        { key: "updatedAt", value: "Last Modified" },
        // { key: "description", value: "Description" },
      ]}
      rows={users}
      on:click:row={handleRowClick}
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
          <Button
            on:click={handleCreateClick}
            disabled={!hasRight(RightType.UPDATE_ROLE, userRights)}
            >Create Role</Button
          >
        </ToolbarContent>
      </Toolbar>
    </DataTable>
    <Pagination
      bind:pageSize
      bind:page
      totalItems={users.length}
      pageSizeInputDisabled
    />
  {/if}
</Content>
