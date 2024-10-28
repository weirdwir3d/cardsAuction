<script>
  import logo from "../assets/Yugioh-logo.svg";
  import { tokenStore } from '../lib/TokenStore';
  import { checkLoggedIn, checkIsAdmin } from "../lib/middleware";
  import Alert from './Alert.svelte';

  export let active;
  let isMenuOpen = false;
  
  let isLoggedIn = false;
  let isAdmin = false;
  let alertVisible = false;
  let alertMessage = "";
  let alertType = "success";

  tokenStore.subscribe(token => {
    console.log('Token from navbar:', token);
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  });

  const handleLogout = () => {
    tokenStore.set({ token: null });
    alertMessage = "Logged out successfully!";
    alertType = "success";
    alertVisible = true;
  };
</script>

<nav class="flex flex-col md:flex-row items-center justify-between w-full px-4 py-2 bg-primary">
  <div class="flex items-center justify-between w-full">
    <img src={logo} alt="Yugioh Logo" class="h-16 w-40 md:h-16 md:w-40 mb-4 md:mb-0" />

    <button 
      class="block md:hidden focus:outline-none" 
      on:click={() => isMenuOpen = !isMenuOpen}
      aria-label="Toggle menu">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
      </svg>
    </button>
  </div>

  <ul class={`flex flex-col md:flex-row items-center justify-end w-full ${isMenuOpen ? '' : 'hidden md:flex'}`}>
    <li class="mr-4">
      <a href="/auctions" class={`px-2 py-2 md:py-0 text-center hover:text-black ${active === "/auctions" ? 'text-accent' : ''}`}>
        Auctions
      </a>
    </li>
    
    {#if isLoggedIn}
      <li class="mr-4">
        <a href="/profile" class={`px-2 py-2 md:py-0 text-center hover:text-black ${active === "/profile" ? 'text-accent' : ''}`}>
          Profile
        </a>
      </li>
      {#if isAdmin}
        <li class="mr-4">
          <a href="/cards" class={`px-2 py-2 md:py-0 text-center hover:text-black ${active === "/cards" ? 'text-accent' : ''}`}>
            Cards
          </a>
        </li>
      {/if}
      <li class="mr-4">
        <a href="/logout" class="px-2 py-2 md:py-0 text-center hover:text-black" on:click={handleLogout}>
          Log Out
        </a>
      </li>
    {:else}
      <li class="mr-4">
        <a href="/login" class={`px-2 py-2 md:py-0 text-center hover:text-black ${active === "/login" ? 'text-accent' : ''}`}>
          Log In
        </a>
      </li>
    {/if}
  </ul>

  <Alert message={alertMessage} type={alertType} isVisible={alertVisible} />
</nav>

