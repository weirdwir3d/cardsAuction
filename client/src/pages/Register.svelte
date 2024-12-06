<script>
  import { tokenStore } from "../lib/TokenStore";
  import { registerUserAPI } from "../lib/api";
  import WelcomeSection from "../components/WelcomeSection.svelte";
  import Button from "../components/buttons/Button.svelte";
  import Alert from "../components/Alert.svelte";
  import { isValidEmail } from "../lib/helper";

  let isLoggedIn = false;
  let isAdmin = false;

  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  //alert
  let alertMessage = "";
  let alertType = "error";
  let showAlert = false;

  async function handleRegister(event) {
    event.preventDefault();
    alertMessage = "";
    alertType = "error";
    showAlert = false;

    if (username.length < 4) {
      alertMessage = "Username must be at least 4 characters long";
      alertType = "error";
      showAlert = true;
      return;
    }

    if (!isValidEmail(email)) {
      alertMessage = "Please enter a valid email address";
      alertType = "error";
      showAlert = true;
      return;
    }

    if (!password) {
      alertMessage = "Password cannot be empty";
      alertType = "error";
      showAlert = true;
      return;
    }

    if (password !== confirmPassword) {
      alertMessage = "Passwords don't match!!";
      alertType = "error";
      showAlert = true;
      return;
    }

    const response = await registerUserAPI({
      username: username,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    });
    const data = await response.json();

    if (response.ok) {
      tokenStore.set({ token: data.token });

      tokenStore.subscribe((value) => {
        if (value.token) {
          //decode token without library (cause i dont want to import the jwt library for just one line of code): https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
          const decodedToken = JSON.parse(atob(value.token.split(".")[1]));
          username = decodedToken.username;
          isAdmin = decodedToken.isAdmin || false;
          isLoggedIn = true;
        }
      });

      alertMessage = "Registration successful!";
      alertType = "success";
      showAlert = true;
    } else {
      alertMessage = data.error;
      alertType = "error";
      showAlert = true;
    }
  }
</script>

<div class="flex flex-col pb-6">
  <h1 class="text-2xl p-4 md:text-3xl lg:text-4xl font-bold text-center">
    Register
  </h1>

  {#if showAlert}
    <Alert message={alertMessage} type={alertType} isVisible={showAlert} />
  {/if}

  {#if isLoggedIn}
    <WelcomeSection {username} {isAdmin} />
  {:else}
    <div class="flex justify-center py-4">
      <form
        on:submit={handleRegister}
        class="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-4/6 lg:1/6"
      >
        <div class="flex flex-col mb-4">
          <input
            type="text"
            placeholder="Username"
            bind:value={username}
            class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
        <div class="flex flex-col mb-4">
          <input
            type="email"
            placeholder="Email"
            bind:value={email}
            class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
        <div class="flex flex-col mb-4">
          <input
            type="password"
            placeholder="Type your password here"
            bind:value={password}
            class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
        <div class="flex flex-col mb-4">
          <input
            type="password"
            placeholder="Confirm your password"
            bind:value={confirmPassword}
            class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>

        <div class="flex items-center justify-start mt-4">
          <Button label="Register" color="accent" onClick={handleRegister} />
          <a
            href="/login"
            class="text-accent underline hover:text-secondary px-2"
          >
            Log in
          </a>
        </div>
      </form>
    </div>
  {/if}
</div>
