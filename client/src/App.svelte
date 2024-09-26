<script>
  import logo from "./assets/Yugioh-logo.svg";
  import router from "page";

  import Navbar from "./components/Navbar.svelte";

  import Auctions from "./pages/Auctions.svelte";
  import Cards from "./pages/Cards.svelte";
  import Bids from "./pages/Bids.svelte";
  import Logout from "./pages/Logout.svelte";
  import Profile from "./pages/Profile.svelte";
  import Login from "./pages/Login.svelte";
  import Register from "./pages/Register.svelte";
  

  let page;
  let params;
  let currentRoute;

  router("/", (ctx) => {
    page = Auctions;
    currentRoute = ctx.pathname;
  });

  router("/auctions", (ctx) => {
    page = Auctions;
    currentRoute = ctx.pathname;
  });

  router("/cards", (ctx) => {
    page = Cards;
    currentRoute = ctx.pathname;
  });

  router("/bids", (ctx) => {
    page = Bids;
    currentRoute = ctx.pathname;
  });

  router("/profile", (ctx) => {
    page = Profile;
    currentRoute = ctx.pathname;
  });

  router("/logout", (ctx) => {
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
    }
  }
</style>
