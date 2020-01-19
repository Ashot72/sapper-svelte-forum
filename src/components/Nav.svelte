<script>
  import { goto } from "@sapper/app";
  import Navbar from "sveltestrap/src/Navbar.svelte";
  import NavbarBrand from "sveltestrap/src/NavbarBrand.svelte";
  import Nav from "sveltestrap/src/Nav.svelte";
  import NavItem from "sveltestrap/src/NavItem.svelte";
  import UncontrolledDropdown from "sveltestrap/src/UncontrolledDropdown.svelte";
  import DropdownToggle from "sveltestrap/src/DropdownToggle.svelte";
  import DropdownMenu from "sveltestrap/src/DropdownMenu.svelte";
  import DropdownItem from "sveltestrap/src/DropdownItem.svelte";
  import ls from "local-storage";
  import Auth from "./Auth.svelte";
  import { authStore } from "../store";
  import { STORAGE_KEY } from "../helpers/constants.js";
  import { signOut } from "../helpers/common.js";

  let isOpen = false;
  let action = null;
</script>

<Navbar color="primary" dark>
  <NavbarBrand href="/">Sapper (Svelte) &nbsp;&nbsp;Forum</NavbarBrand>
  <UncontrolledDropdown style="color:white">
    <DropdownToggle nav caret style="color:white">
      {$authStore.email || 'Sign In'}
    </DropdownToggle>
    <DropdownMenu right>
      {#if $authStore.email}
        <DropdownItem on:click={signOut}>Sign Out</DropdownItem>
      {:else}
        <DropdownItem on:click={() => ((isOpen = true), (action = 'signIn'))}>
          Sign In
        </DropdownItem>
        <DropdownItem on:click={() => ((isOpen = true), (action = 'signUp'))}>
          Sign Up
        </DropdownItem>
      {/if}
    </DropdownMenu>
  </UncontrolledDropdown>
</Navbar>
<Auth bind:isOpen bind:action>
  {action === 'signUp' ? 'Sign Up' : 'Sign In'}
</Auth>
