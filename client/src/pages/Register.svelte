<script>
    import TextInput from "../lib/TextInput.svelte";
    import EmailInput from "../lib/EmailInput.svelte";
    import PasswordInput from "../lib/PasswordInput.svelte";
    import Button from "../lib/Button.svelte";
    import Alert from "../lib/Alert.svelte"; // Import the custom Alert component

    let username = "";
    let email = "";
    let password = "";
    let confirmPassword = "";

    let alertMessage = "";
    let alertType = "error"; // Default to error
    let isAlertVisible = false; // Control alert visibility

    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function handleRegister(event) {
        event.preventDefault();

        // Frontend validation
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

        // If all validations pass, proceed with registration
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password, confirmPassword }),
        });

        const data = await response.json();

        if (response.ok) {
            alertMessage = "Registration successful!";
            alertType = "success";
            isAlertVisible = true;
            // Redirect to Auctions page
            setTimeout(() => {
                window.location.href = '/auctions'; // Replace with your Auctions page route
            }, 1500); // 1.5 seconds delay before redirect
        } else {
            alertMessage = data.message || "Registration error!";
            alertType = "error";
            isAlertVisible = true;
        }
    }
</script>

<h1 class="text-3xl font-bold">Register</h1>

<Alert message={alertMessage} type={alertType} isVisible={isAlertVisible} />

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
