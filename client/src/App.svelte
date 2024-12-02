<script>
  import { tokenStore } from "./lib/TokenStore";
  import { checkIsAdmin, checkLoggedIn } from "./lib/middleware";
  import router from "page";
  import Navbar from "./components/Navbar.svelte";
  import Auctions from "./pages/Auctions.svelte";
  import AuctionDetails from "./pages/AuctionDetails.svelte";
  import Cards from "./pages/Cards.svelte";
  import CardDetails from "./pages/CardDetails.svelte";
  import Profile from "./pages/Profile.svelte";
  import Login from "./pages/Login.svelte";
  import Register from "./pages/Register.svelte";
  import Forbidden from "./pages/Forbidden.svelte";
  import Unauthorized from "./pages/Unauthorized.svelte";

  let page;
  let params;
  let currentRoute;
  let token;

  tokenStore.subscribe((value) => {
    token = value.token;
    // if (token) {
    //   ('token is available');
    // }
  });

  //for content only admins can access (code from slides)
  function admin_only(ctx, next) {
    if (checkIsAdmin()) {
      next();
    } else {
      page = Forbidden;
      currentRoute = ctx.pathname;
    }
  }

  // for content only logged in users can access
  function login_only(ctx, next) {
    if (checkLoggedIn()) {
      next();
    } else {
      page = Unauthorized;
      currentRoute = ctx.pathname;
    }
  }

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

  router("/cards/:id", admin_only,(ctx) => {
    page = CardDetails;
    currentRoute = ctx.pathname;
    params = ctx.params;
  });

  router("/auctions/:id", (ctx) => {
    page = AuctionDetails;
    currentRoute = ctx.pathname;
    params = ctx.params;
  });

  router("/profile", login_only, (ctx) => {
    page = Profile;
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

  router.start();
</script>

<main>
  <Navbar active={currentRoute} />
</main>

<!-- constant top padding to compensate for navbar -->
<body class="bg-background pt-24">
  <svelte:component this={page} {params} />
</body>

<!-- default tailwind setup -->
<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    :root {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }
  }
</style>
