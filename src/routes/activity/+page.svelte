<script>
  //@ts-nocheck
  import {
    Content,
    DataTable,
    Loading,
    Pagination,
  } from "carbon-components-svelte";
  import { onMount, onDestroy } from "svelte";
  import { token } from "../../helper/token_store";
  import { PUBLIC_API_URI } from "$env/static/public";
  import { goto } from "$app/navigation";
  import { authenticate } from "../../helper/utils";

  let activities = null;
  let loading = true;
  let pageSize = 10;
  let page = 1;

  let token_;

  token.subscribe((value) => {
    token_ = value;
  });

  const fetchActivity = async () => {
    loading = true;
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token_}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
      mode: "cors",
    };

    const response = await fetch(`${PUBLIC_API_URI}/activity`, requestOptions);

    const data = response.json();
    loading = false;
    return data;
  };

  const handleRowClick = (row) => {
    console.log(row);
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

    const data = await fetchActivity();
    activities = data["data"]["activities"] ?? [];
    activities = activities.map((activity) => {
      let new_obj = {};
      delete Object.assign(new_obj, activity, { ["id"]: activity["_id"] })[
        "_id"
      ];
      return new_obj;
    });
    console.log(activities);
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
  {#if activities === null && loading === false}
    Nothing to show!
  {:else if loading === true}
    <Loading />
  {:else}
    <DataTable
      title="Activity"
      description="Lavange ipo activity list"
      sortable
      headers={[
        {
          key: "activityType",
          value: "Activity Type",
          display: (activityType) => activityType.toUpperCase(),
        },
        {
          key: "timestamp",
          value: "Timestamp",
          display: (date) => new Date(date).toLocaleString(),
          //sort: (a, b) => new Date(b) - new Date(a),
        },
        { key: "user.username", value: "User" },
        { key: "description", value: "Description" },
      ]}
      rows={activities}
      {pageSize}
      on:click:row={handleRowClick}
      {page}
    />
    <Pagination
      bind:pageSize
      bind:page
      totalItems={activities.length}
      pageSizeInputDisabled
    />
  {/if}
</Content>
