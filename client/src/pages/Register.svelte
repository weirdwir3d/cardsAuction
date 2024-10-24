<script>
    import TextInput from "../lib/TextInput.svelte";
    import EmailInput from "../lib/EmailInput.svelte";
    import PasswordInput from "../lib/PasswordInput.svelte";
    import Button from "../lib/Button.svelte";
    import Alert from "../lib/Alert.svelte"; 
    import WelcomeSection from "../lib/WelcomeSection.svelte";
    import { tokenStore } from '../TokenStore'; // Import the tokenStore
    import { registerUserAPI } from '../api'; // Import the registerUser function

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
        console.log('Starting registration process');
        resetAlert();

        if (username.length < 4) {
            console.log('Username validation failed');
            alertMessage = "Username must be at least 4 characters long.";
            alertType = "error";
            isAlertVisible = true;
            return;
        }

        if (!isValidEmail(email)) {
            console.log('Email validation failed');
            alertMessage = "Please enter a valid email address.";
            alertType = "error";
            isAlertVisible = true;
            return;
        }

        if (!password) {
            console.log('Password is empty');
            alertMessage = "Password cannot be empty.";
            alertType = "error";
            isAlertVisible = true;
            return;
        }

        if (password !== confirmPassword) {
            console.log('Passwords do not match');
            alertMessage = "Passwords don't match!";
            alertType = "error";
            isAlertVisible = true;
            return;
        }

        console.log('All validations passed, sending registration request');
        try {
            const data = await registerUserAPI({ username, email, password, confirmPassword });
            console.log('Received response from server:', data);
            
            tokenStore.set({ token: data.token });

            tokenStore.subscribe(value => {
                console.log('Token stored in tokenStore:', value.token); 
                
                if (value.token) {
                    const decodedToken = JSON.parse(atob(value.token.split('.')[1]));
                    username = decodedToken.username || "User";
                    isAdmin = decodedToken.isAdmin || false;
                    isLoggedIn = true;
                }
            })();

            alertMessage = "Registration successful!";
            alertType = "success";
            isAlertVisible = true;
        } catch (error) {
            console.error("Registration error:", error);
            alertMessage = "An error occurred during registration.";
            alertType = "error";
            isAlertVisible = true;
        }
    }
</script>

<h1 class="text-3xl font-bold">Register</h1>

{#if isAlertVisible}
  <Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />
{/if}

{#if isLoggedIn}
  <WelcomeSection {username} {isAdmin} />
{:else}
  <form on:submit={handleRegister} class="p-4">
    <TextInput placeholder="Username" bind:value={username} />
    <EmailInput placeholder="Email" bind:value={email} />
    <PasswordInput placeholder="Type your password here" bind:value={password} />
    <PasswordInput placeholder="Confirm your password" bind:value={confirmPassword} />
    
    <div class="flex items-center justify-between mt-4">
        <Button label="Register" type="submit" />
        <a href="/login" class="text-tertiary underline hover:text-secondary transition duration-150 ease-in-out">
            Log in
        </a>
    </div>
  </form>
{/if}
