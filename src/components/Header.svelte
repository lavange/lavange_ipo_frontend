<script>
  //@ts-nocheck
  import {
    Header,
    HeaderUtilities,
    HeaderAction,
    HeaderGlobalAction,
    HeaderPanelLinks,
    HeaderPanelDivider,
    HeaderPanelLink,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SkipToContent,
    Content,
    Grid,
    Row,
    Column,
  } from "carbon-components-svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  import UserAvatarFilledAlt from "carbon-icons-svelte/lib/UserAvatarFilledAlt.svelte";
  import { token } from "../helper/token_store";
  import { onMount } from "svelte";
  import * as jwt from "jsonwebtoken-esm";
  import { RightType } from "../helper/constants";
  import { hasRight } from "../helper/utils";

  let isSideNavOpen = false;
  let isOpen1 = false;
  let isOpen2 = false;
  let decodedToken;
  let name = "";
  let _id = "";
  let rights = [];

  let token_;

  const menu_items = [
    {
      id: "ipo",
      title: "IPO",
      right: RightType.VIEW_IPO
    },
    {
      id: "activity",
      title: "Activity",
      right: RightType.VIEW_ACTIVITY
    },
    {
      id: "user",
      title: "User",
      right: RightType.VIEW_USER
    },
    {
      id: "calculator",
      title: "Calculator",
      right: RightType.VIEW_IPO
    },
    {
      id: "order",
      title: "Order",
      right: RightType.VIEW_ORDER
    },
    {
      id:"stock",
      title: "Stock",
      right: RightType.VIEW_STOCK
    },
    {
      id:"role",
      title: "Role",
      right: RightType.VIEW_ROLE
    }
  ];

  token.subscribe((value) => {
    token_ = value;
  });

  onMount(async () => {
    await token;
    decodedToken = await jwt.decode(token_, {
      complete: true,
    });
    console.log(decodedToken);

    rights =  decodedToken.payload.role.rights;

    if (decodedToken) {
      name =
        decodedToken.payload.firstName + " " + decodedToken.payload.lastName;
    }
  });

  $: { 
    decodedToken ? name = decodedToken.payload.firstName + " " + decodedToken.payload.lastName : ""; 
     if(decodedToken) {
      _id = decodedToken.payload.userId
     }
  }
</script>

<Header company="Lavange" platformName="IPO" bind:isSideNavOpen>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  {#if token_}
    <HeaderUtilities>
      <!-- <HeaderGlobalAction aria-label="Settings" icon={SettingsAdjust} /> -->
      <HeaderAction
        bind:isOpen={isOpen1}
        icon={UserAvatarFilledAlt}
        closeIcon={UserAvatarFilledAlt}
        text={name}
      >
        <HeaderPanelLinks>
          {#if hasRight(RightType.VIEW_USER,rights)}
          <HeaderPanelLink href={`/user/${_id}`}>User</HeaderPanelLink>
          {/if}
          <HeaderPanelLink href="/logout">Log out</HeaderPanelLink>

          <!-- <HeaderPanelDivider>Switcher subject 1</HeaderPanelDivider>
        <HeaderPanelLink>Switcher item 1</HeaderPanelLink>
        <HeaderPanelLink>Switcher item 2</HeaderPanelLink>
        <HeaderPanelLink>Switcher item 3</HeaderPanelLink>
        <HeaderPanelLink>Switcher item 4</HeaderPanelLink>
        <HeaderPanelDivider>Switcher subject 2</HeaderPanelDivider>
        <HeaderPanelLink>Switcher item 1</HeaderPanelLink>
        <HeaderPanelLink>Switcher item 2</HeaderPanelLink>
        <HeaderPanelDivider>Switcher subject 3</HeaderPanelDivider>
        <HeaderPanelLink>Switcher item 1</HeaderPanelLink> -->
        </HeaderPanelLinks>
      </HeaderAction>
      <HeaderAction bind:isOpen={isOpen2}>
      <HeaderPanelLinks>
        <HeaderPanelLink href="/">Home</HeaderPanelLink>
        {#each menu_items.filter((item_)=>hasRight(item_.right,rights)) as {id,title}}
        <HeaderPanelLink href={id} >{title}</HeaderPanelLink>
        {/each}
        <!-- <HeaderPanelDivider>Switcher subject 2</HeaderPanelDivider>
        <HeaderPanelLink>Switcher item 1</HeaderPanelLink>
        <HeaderPanelLink>Switcher item 2</HeaderPanelLink>
        <HeaderPanelLink>Switcher item 3</HeaderPanelLink>
        <HeaderPanelLink>Switcher item 4</HeaderPanelLink>
        <HeaderPanelLink>Switcher item 5</HeaderPanelLink> -->
      </HeaderPanelLinks>
    </HeaderAction>
    </HeaderUtilities>
  {/if}
</Header>

<!-- <SideNav bind:isOpen={isSideNavOpen}>
  <SideNavItems>
    <SideNavLink text="Link 1" />
    <SideNavLink text="Link 2" />
    <SideNavLink text="Link 3" />
    <SideNavMenu text="Menu">
      <SideNavMenuItem href="/" text="Link 1" />
      <SideNavMenuItem href="/" text="Link 2" />
      <SideNavMenuItem href="/" text="Link 3" />
    </SideNavMenu>
  </SideNavItems>
</SideNav> -->
