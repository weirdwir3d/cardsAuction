<script>
  import PasswordInput from "../lib/PasswordInput.svelte";
  import EmailInput from "../lib/EmailInput.svelte";
  import Button from "../lib/Button.svelte";
  import Alert from "../lib/Alert.svelte"; // Include the alert
  import WelcomeSection from "../lib/WelcomeSection.svelte";
  import { tokenStore } from "../TokenStore";
  import { checkLoggedIn, checkIsAdmin } from "../middleware";

  let email = "";
  let password = "";

  let alertMessage = "";
  let alertType = "error";
  let isAlertVisible = false;
  let username = "";
  let isLoggedIn = false;
  let isAdmin = false;

  // Reset alert and login state
  function resetAlert() {
    alertMessage = "";
    alertType = "error";
    isAlertVisible = false;
  }

  async function handleLogin(event) {
    event.preventDefault();
    console.log("Logging in with", email, password);

    // Reset any previous alert and state before attempting login
    resetAlert();

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Received response from server:", data);

      if (data.httpStatusCode === 200) {
        console.log("Login successful, updating token store");
        tokenStore.set({ token: data.token });

        tokenStore.subscribe((value) => {
          console.log("Token stored in tokenStore:", value.token);
          isLoggedIn = checkLoggedIn(value.token);
          isAdmin = isLoggedIn && checkIsAdmin(value.token);

          const decodedToken = JSON.parse(atob(value.token.split(".")[1]));
          username = decodedToken.username || "User";
        })();

        // Set success message
        alertMessage = "Login successful!";
        alertType = "success";
        isAlertVisible = true;
      } else {
        handleLoginError(data);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alertMessage = "An unexpected error occurred. Please try again later.";
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
    isAlertVisible = true; // Ensure the alert is visible
  }
</script>

<h1 class="text-3xl font-bold">Log in</h1>

<!-- Display the alert when an error or success message exists -->
{#if isAlertVisible}
  <Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />
{/if}

{#if isLoggedIn}
  <WelcomeSection {username} {isAdmin} />
{:else}
  <!-- Show the form when the user is not logged in -->
  <form on:submit={handleLogin} class="p-4">
    <EmailInput placeholder="Email" bind:value={email} />
    <PasswordInput
      placeholder="Type your password here"
      bind:value={password}
    />
    <div class="flex items-center justify-between mt-4">
      <Button label="Log in" type="submit" />
      <a
        href="/register"
        class="text-tertiary underline hover:text-secondary transition duration-150 ease-in-out"
        >Register</a
      >
    </div>
  </form>
{/if}
