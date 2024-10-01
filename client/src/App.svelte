<script>
  import logo from "./assets/Yugioh-logo.svg";
  import router from "page";

  import Navbar from "./components/Navbar.svelte";

  import Auctions from "./pages/Auctions.svelte";
  import Cards from "./pages/Cards.svelte";
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

  // Middleware function for admin-only routes
  function admin_only(ctx, next) {
    if (checkIsAdmin()) {
      next(); // Proceed to the route
    } else {
      router.redirect("/forbidden"); // Redirect to home if not admin
    }
  }

  // Middleware function for login-only routes
  function login_only(ctx, next) {
    if (checkLoggedIn()) {
      next(); // Proceed to the route
    } else {
      router.redirect("/unauthorized"); // Redirect to login if not authenticated
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
