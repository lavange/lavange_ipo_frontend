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
  } from "carbon-components-svelte";
  import { onMount, onDestroy } from "svelte";
  import { token } from "../../helper/token_store";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { goto } from "$app/navigation";
  import { authenticate, hasRight } from "../../helper/utils";
  import { RightType } from "../../helper/constants";
  import * as jwt from "jsonwebtoken-esm";

  let roles = null;
  let loading = true;
  let pageSize = 10;
  let page = 1;
  let userRights = [];

  let token_;

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

    const response = await fetch(`${PUBLIC_API_URI}/role`, requestOptions);

    const data = response.json();
    loading = false;
    return data;
  };

  const handleRowClick = (row) => {
    goto(`/role/${row.detail.id}`);
  };

  const handleCreateClick = () => {
    goto(`/role/create`);
  };

  const handleUploadClick = () => {
    goto(`/role/upload`);
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

    const data = await fetchRole();
    roles = data["data"]["roles"] ?? [];
    roles = roles.map((role) => {
      let new_obj = {};
      delete Object.assign(new_obj, role, { ["id"]: role["_id"] })["_id"];
      return new_obj;
    });
    console.log(roles);
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
  {#if roles === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <DataTable
      title="Role"
      description="Lavange ipo role list"
      sortable
      headers={[
        { key: "id", value: "Role Id" },
        { key: "name", value: "Role Name" },
        {
          key: "rights",
          value: "No. of Rights",
          display: (data) => data.length,
        },
        {
          key: "updatedAt",
          value: "Modified",
          display: (date) => new Date(date).toLocaleString(),
        },
      ]}
      rows={roles}
      on:click:row={handleRowClick}
      {pageSize}
      {page}
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
      totalItems={roles.length}
      pageSizeInputDisabled
    />
  {/if}
</Content>
