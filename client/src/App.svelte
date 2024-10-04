<script>
  import { tokenStore } from './TokenStore';
  import router from "page";

  import Navbar from "./components/Navbar.svelte";

  import Auctions from "./pages/Auctions.svelte";
  import AuctionDetails from "./pages/AuctionDetails.svelte";
  import Cards from "./pages/Cards.svelte";
  import CardDetails from "./pages/CardDetails.svelte";
  import Bids from "./pages/Bids.svelte";
  import Logout from "./pages/Logout.svelte";
  import Login from "./pages/Login.svelte";
  import Register from "./pages/Register.svelte";
  import Forbidden from "./pages/Forbidden.svelte";
  import Unauthorized from "./pages/Unauthorized.svelte";

  // Import middleware functions
  import { checkIsAdmin, checkLoggedIn } from "./middleware";

  let page;
  let params;
  let currentRoute;

    // Subscribe to tokenStore for global access
  let token;
  tokenStore.subscribe(value => {
    token = value.token;
    if (token) {
      console.log('Token is available');
    }
  });

  // Middleware function for admin-only routes
  function admin_only(ctx, next) {
    if (checkIsAdmin()) {
      next(); // Proceed to the route
    } else {
          page = Forbidden;
    currentRoute = ctx.pathname;
    }
  }

  // Middleware function for login-only routes
  function login_only(ctx, next) {
    if (checkLoggedIn()) {
      next(); // Proceed to the route
    } else {
          page = Unauthorized;
    currentRoute = ctx.pathname;
    }
  }

  // Define routes
  router("/", (ctx) => {
    page = Auctions;
    currentRoute = ctx.pathname;
  });

  router("/auctions", (ctx) => {
    page = Auctions;
    currentRoute = ctx.pathname;
  });

  router("/cards", admin_only, (ctx) => {
    page = Cards;
    currentRoute = ctx.pathname;
  });

  router("/cards/:id", (ctx) => {
    page = CardDetails;
    currentRoute = ctx.pathname;
    params = ctx.params;
  });

  router("/auctions/:id", (ctx) => {
    page = AuctionDetails;
    currentRoute = ctx.pathname;
    params = ctx.params;
  });

  router("/bids", login_only, (ctx) => {
    page = Bids;
    currentRoute = ctx.pathname;
  });

  router("/logout", login_only, (ctx) => {
    page = Logout;
    currentRoute = ctx.pathname;
  });

  router("/login", (ctx) => {
    page = Login;
    currentRoute = ctx.pathname;
  });

  router("/register", (ctx) => {
    page = Register;
    currentRoute = ctx.pathname;
  });

  router("/forbidden", (ctx) => {
    page = Forbidden;
    currentRoute = ctx.pathname;
  });

  router("/unauthorized", (ctx) => {
    page = Unauthorized;
    currentRoute = ctx.pathname;
  });

  // Start the router
  router.start();
</script>

<main>
  <Navbar active={currentRoute} />
</main>

<body class="bg-background">
  <svelte:component this={page} {params} />
</body>

<!-- Global styles -->
<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    :root {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      color: purple;
    }
  }
</style>
