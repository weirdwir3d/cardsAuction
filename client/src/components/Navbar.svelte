<script>
  import logo from "../assets/Yugioh-logo.svg";
  import { tokenStore } from '../TokenStore';
  import { checkLoggedIn, checkIsAdmin } from "../middleware";
  import Alert from '../lib/Alert.svelte'; // Import the Alert component

  export let active;
  let isMenuOpen = false;
  
  let isLoggedIn = false;
  let isAdmin = false;
  let alertVisible = false; // State for alert visibility
  let alertMessage = ""; // Message to display in the alert
  let alertType = "success"; // Type of alert

  tokenStore.subscribe(token => {
    console.log('Token from navbar:', token);
    isLoggedIn = checkLoggedIn(token);
    isAdmin = isLoggedIn && checkIsAdmin(token);
  });

  const handleLogout = () => {
    tokenStore.set({ token: null });
    // Set alert message and visibility
    alertMessage = "Logged out successfully!";
    alertType = "success";
    alertVisible = true;
  };
</script>

<nav class="flex flex-col md:flex-row items-center justify-between max-w-5xl w-full px-4 py-2 bg-secondary">
  <div class="flex items-center justify-between w-full md:w-auto">
    <img src={logo} alt="Yugioh Logo" class="h-16 w-40 md:h-16 md:w-40 mb-4 md:mb-0" />

    <button 
      class="block md:hidden focus:outline-none" 
      on:click={() => isMenuOpen = !isMenuOpen}
      aria-label="Toggle menu">
      <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
      </svg>
    </button>
  </div>

  <ul class={`flex flex-col md:flex-row items-center justify-evenly w-full md:w-auto ${isMenuOpen ? '' : 'hidden md:flex'}`}>
    <li><a class:active={active === "/auctions"} href="/auctions" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">Auctions</a></li>
    
    {#if isLoggedIn}
      <li><a class:active={active === "/profile"} href="/profile" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">Profile</a></li>
      {#if isAdmin}
        <li><a class:active={active === "/cards"} href="/cards" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">Cards</a></li>
      {/if}
      <li>
        <a class:active={active === "/logout"} href="/logout" class="px-4 py-2 md:py-0 text-center hover:text-tertiary" on:click={handleLogout}>
          Log Out
        </a>
      </li>
    {:else}
      <li><a class:active={active === "/login"} href="/login" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">Log In</a></li>
    {/if}
  </ul>

  <!-- Include the Alert component -->
  <Alert message={alertMessage} type={alertType} isVisible={alertVisible} />
</nav>
