<script>
  import PasswordInput from "../lib/PasswordInput.svelte";
  import EmailInput from "../lib/EmailInput.svelte";
  import Button from "../lib/Button.svelte";
  import Alert from "../lib/Alert.svelte"; 
  import WelcomeSection from "../lib/WelcomeSection.svelte";
  import { tokenStore } from "../TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../middleware";
  import { loginAPI } from '../api'; // Import the new API function

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
      const { response, data } = await loginAPI(email, password); // Call the API function

      console.log("Received response from server:", data);

      if (response.ok) {
        console.log("Login successful, updating token store");
        tokenStore.set({ token: data.token });

        tokenStore.subscribe((value) => {
          console.log("Token stored in tokenStore:", value.token);
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
      console.error("Error logging in:", error);
      alertMessage = error.message; // Use error message from catch block
      alertType = "error";
      isAlertVisible = true;
    }
  }

  function handleLoginError(data) {
    if (data.httpStatusCode === 401) {
      alertMessage = "Incorrect password. Please try again.";
    } else if (data.httpStatusCode === 404) {
      alertMessage = "User not found. Please check your email or register.";
    } else if (data.httpStatusCode === 500) {
      alertMessage = "Server error. Please contact admin.";
    } else {
      alertMessage = data.message || "Login failed. Please try again.";
    }
    alertType = "error";
    isAlertVisible = true;
  }
</script>

<h1 class="text-3xl font-bold">Log in</h1>

{#if isAlertVisible}
  <Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />
{/if}

{#if isLoggedIn}
  <WelcomeSection {username} {isAdmin} />
{:else}
  <form on:submit={handleLogin} class="p-4">
    <EmailInput placeholder="Email" bind:value={email} />
    <PasswordInput placeholder="Type your password here" bind:value={password} />
    <div class="flex items-center justify-between mt-4">
      <Button label="Log in" type="submit" />
      <a
        href="/register"
        class="text-tertiary underline hover:text-secondary transition duration-150 ease-in-out"
      >Register</a>
    </div>
  </form>
{/if}
