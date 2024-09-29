<script>
    import logo from "../assets/Yugioh-logo.svg";
    export let active;
    let isMenuOpen = false; // State to track if the menu is open
</script>

<nav class="flex flex-col md:flex-row items-center justify-between max-w-5xl w-full px-4 py-2 bg-secondary">
    <!-- Flex container to align logo and hamburger button horizontally -->
    <div class="flex items-center justify-between w-full md:w-auto">
        <!-- Logo -->
        <img src={logo} alt="Yugioh Logo" class="h-16 w-40 md:h-16 md:w-40 mb-4 md:mb-0" />

        <!-- Hamburger button (visible on small screens) -->
        <button 
            class="block md:hidden focus:outline-none" 
            on:click={() => isMenuOpen = !isMenuOpen}
            aria-label="Toggle menu">
            <!-- Hamburger icon (3 bars) -->
            <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
        </button>
    </div>

    <!-- Navigation links (conditionally rendered) -->
    <ul class={`flex flex-col md:flex-row items-center justify-evenly w-full md:w-auto ${isMenuOpen ? '' : 'hidden md:flex'}`}>
        <li><a class:active={active === "/auctions"} href="/auctions" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">Auctions</a></li>
        <li><a class:active={active === "/cards"} href="/cards" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">Cards</a></li>
        <li><a class:active={active === "/bids"} href="/bids" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">My bids</a></li>
        <li><a class:active={active === "/login"} href="/login" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">Log in</a></li>
        <li><a class:active={active === "/logout"} href="/logout" class="px-4 py-2 md:py-0 text-center hover:text-tertiary">Log out</a></li>
    </ul>
</nav>
