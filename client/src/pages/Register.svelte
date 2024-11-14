<script>
  import Button from "../components/Button.svelte";
  import Alert from "../components/Alert.svelte";
  import WelcomeSection from "../components/WelcomeSection.svelte";
  import { tokenStore } from "../lib/TokenStore";
  import { registerUserAPI } from "../lib/api";

  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";

  let alertMessage = "";
  let alertType = "error";
  let isAlertVisible = false;
  let isLoggedIn = false;
  let isAdmin = false;

  function resetAlert() {
    alertMessage = "";
    alertType = "error";
    isAlertVisible = false;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleRegister(event) {
    event.preventDefault();
    console.log("Starting registration process");
    resetAlert();

    if (username.length < 4) {
        alertMessage = "Username must be at least 4 characters long.";
        alertType = "error";
        isAlertVisible = true;
        return;
    }

    if (!isValidEmail(email)) {
        alertMessage = "Please enter a valid email address.";
        alertType = "error";
        isAlertVisible = true;
        return;
    }

    if (!password) {
        alertMessage = "Password cannot be empty.";
        alertType = "error";
        isAlertVisible = true;
        return;
    }

    if (password !== confirmPassword) {
        alertMessage = "Passwords don't match!";
        alertType = "error";
        isAlertVisible = true;
        return;
    }

    try {
        const response = await registerUserAPI({ username, email, password, confirmPassword });

        if (response.httpStatusCode === 409) {
            alertMessage = "Email address already in use.";
            alertType = "error";
            isAlertVisible = true;
        } else if (response.httpStatusCode === 200) {
            const data = response;
            tokenStore.set({ token: data.token });
            const unsubscribe = tokenStore.subscribe((value) => {
                if (value.token) {
                    const decodedToken = JSON.parse(atob(value.token.split(".")[1]));
                    username = decodedToken.username || "User";
                    isAdmin = decodedToken.isAdmin || false;
                    isLoggedIn = true;
                }
            });
            unsubscribe();

            alertMessage = "Registration successful!";
            alertType = "success";
            isAlertVisible = true;
        } else {
            alertMessage = "An unknown error occurred.";
            alertType = "error";
            isAlertVisible = true;
        }
    } catch (error) {
        alertMessage = "An error occurred during registration.";
        alertType = "error";
        isAlertVisible = true;
    }
  }
</script>

<div class="flex flex-col pb-6">
  <h1 class="text-2xl p-4 md:text-3xl lg:text-4xl font-bold text-center">Register</h1>

{#if isAlertVisible}
  <Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />
{/if}

{#if isLoggedIn}
  <WelcomeSection {username} {isAdmin} />
{:else}
<div class="flex justify-center py-4">
  <form on:submit={handleRegister} class="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-4/6 lg:1/6">
    <div class="flex flex-col mb-4">
    <input
      type="text"
      placeholder="Username"
      bind:value={username}
      class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out w-full"
    />
    </div>
    <div class="flex flex-col mb-4">
    <input
      type="email"
      placeholder="Email"
      bind:value={email}
      class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out w-full"
    />
    </div>
    <div class="flex flex-col mb-4">
    <input
      type="password"
      placeholder="Type your password here"
      bind:value={password}
      class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out w-full"
    />
    </div>
    <div class="flex flex-col mb-4">
    <input
      type="password"
      placeholder="Confirm your password"
      bind:value={confirmPassword}
      class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out w-full"
    />
    </div>

    <div class="flex items-center justify-start mt-4">
      <Button label="Register" color="danger" onClick={handleRegister} />
      <a href="/login" class="text-accent underline hover:text-secondary transition duration-150 ease-in-out px-2">
        Log in
      </a>
    </div>
  </form>
  </div>
{/if}
</div>