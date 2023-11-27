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

  let isSideNavOpen = false;
  let isOpen1 = false;
  let isOpen2 = false;
  let decodedToken;
  let name = "";

  let token_;

  token.subscribe((value) => {
    token_ = value;
  });

  onMount(async () => {
    await token;
    decodedToken = jwt.decode(token_, {
      complete: true,
    });
    console.log(decodedToken);
    if (decodedToken) {
      name =
        decodedToken.payload.firstName + " " + decodedToken.payload.lastName;
    }
  });

  $:  decodedToken ? name = decodedToken.payload.firstName + " " + decodedToken.payload.lastName : "";
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
        <HeaderPanelLink href="/ipo">IPO</HeaderPanelLink>
        <!-- <HeaderPanelDivider>Switcher subject 1</HeaderPanelDivider> -->
        <HeaderPanelLink href="/activity">Activity</HeaderPanelLink>
        <HeaderPanelLink href="/user">User</HeaderPanelLink>
        <HeaderPanelLink href="/calculator">Calculator</HeaderPanelLink>
        <HeaderPanelLink href="/order">Order</HeaderPanelLink>
        <HeaderPanelLink href="/stock">Stock</HeaderPanelLink>
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
