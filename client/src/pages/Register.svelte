<script>
    import TextInput from "../lib/TextInput.svelte";
    import EmailInput from "../lib/EmailInput.svelte";
    import PasswordInput from "../lib/PasswordInput.svelte";
    import Button from "../lib/Button.svelte";
    import Alert from "../lib/Alert.svelte"; 
    import WelcomeSection from "../lib/WelcomeSection.svelte";
    import { tokenStore } from '../TokenStore'; // Import the tokenStore

    let username = "";
    let email = "";
    let password = "";
    let confirmPassword = "";

    let alertMessage = "";
    let alertType = "error";
    let isAlertVisible = false;
    let isLoggedIn = false;
    let isAdmin = false;

    // Reset alert and login state
    function resetAlert() {
        alertMessage = "";
        alertType = "error";
        isAlertVisible = false;
    }

    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function handleRegister(event) {
        event.preventDefault();

        // Frontend validation with console logs
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

        // Proceed with registration if validations pass
        console.log('All validations passed, sending registration request');
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password, confirmPassword }),
        });

        const data = await response.json();
        console.log('Received response from server:', data);

        if (response.ok) {
            console.log('Registration successful, updating token store');
            tokenStore.set({ token: data.token }); // Update the tokenStore

            // Immediately check the stored token
            tokenStore.subscribe(value => {
                console.log('Token stored in tokenStore:', value.token); // Log the token
                
                if (value.token) {
                    // Decode the token to get the username and admin status
                    const decodedToken = JSON.parse(atob(value.token.split('.')[1]));
                    username = decodedToken.username || "User";
                    isAdmin = decodedToken.isAdmin || false;

                    // Set isLoggedIn to true after successful registration
                    isLoggedIn = true;
                }
            })();

            alertMessage = "Registration successful!";
            alertType = "success";
            isAlertVisible = true;
        }
    }
</script>

<h1 class="text-3xl font-bold">Register</h1>

{#if isAlertVisible}
  <Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />
{/if}

{#if isLoggedIn}
  <WelcomeSection {username} {isAdmin} /> <!-- Show welcome section when logged in -->
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
