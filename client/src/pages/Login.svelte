<script>
  import Button from "../components/Button.svelte";
  import Alert from "../components/Alert.svelte";
  import WelcomeSection from "../components/WelcomeSection.svelte";
  import { tokenStore } from "../lib/TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../lib/middleware";
  import { loginAPI } from "../lib/api";

  let email = "";
  let password = "";
  let alertMessage = "";
  let alertType = "error";
  let isAlertVisible = false;
  let username = "";
  let isLoggedIn = false;
  let isAdmin = false;

  function resetAlert() {
    alertMessage = "";
    alertType = "error";
    isAlertVisible = false;
  }

  async function handleLogin(event) {
    event.preventDefault();
    console.log("Logging in with", email, password);
    resetAlert();

    try {
      const { response, data } = await loginAPI(email, password);
      console.log("Received response from server:", data);

      if (response.ok) {
        tokenStore.set({ token: data.token });

        tokenStore.subscribe((value) => {
          isLoggedIn = checkLoggedIn(value.token);
          isAdmin = isLoggedIn && checkIsAdmin(value.token);
          const decodedToken = JSON.parse(atob(value.token.split(".")[1]));
          username = decodedToken.username || "User";
        })();

        alertMessage = "Login successful!";
        alertType = "success";
        isAlertVisible = true;
      } else {
        handleLoginError(data);
      }
    } catch (error) {
      alertMessage = error.message;
      alertType = "error";
      isAlertVisible = true;
    }
  }

  function handleLoginError(data) {
    console.log('DATA http status code:', data.httpStatusCode);
    if (data.httpStatusCode === 401) {
      alertMessage = "Incorrect password. Please try again.";
    } else if (data.httpStatusCode === 404) {
      alertMessage = "User not found. Please check your email or register.";
    } else if (data.httpStatusCode === 500) {
      alertMessage = "Server error. Please contact admin.";
    } else {
      alertMessage = data.message || "An unexpected error occurred. Please try again later.";
    }
    alertType = "error";
    isAlertVisible = true;
  }
</script>

<div class="flex flex-col pb-6">
  <h1 class="text-2xl p-4 md:text-3xl lg:text-4xl font-bold text-center">Log in</h1>

  {#if isAlertVisible}
    <Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />
  {/if}

  {#if isLoggedIn}
    <WelcomeSection {username} {isAdmin} />
  {:else}
    <div class="flex justify-center py-4">
      <form
        class="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-4/6 lg:1/6"
        on:submit|preventDefault={handleLogin}
      >
        <div class="flex flex-col mb-4">
          <input
            type="email"
            bind:value={email}
            placeholder="Email"
            class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out w-full"
          />
        </div>
        <div class="flex flex-col mb-4">
          <input
            type="password"
            bind:value={password}
            placeholder="Type your password here"
            class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out w-full"
          />
        </div>
        <div class="flex items-center justify-start mt-4">
          <Button label="Log in" color="danger" onClick={handleLogin} />
          <a
            href="/register"
            class="text-accent underline hover:text-secondary transition duration-150 ease-in-out px-2"
            >Register</a
          >
        </div>
      </form>
    </div>
  {/if}
</div>
