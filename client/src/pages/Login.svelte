<script>
    import TextInput from "../lib/TextInput.svelte";
    import PasswordInput from "../lib/PasswordInput.svelte";
    import Button from "../lib/Button.svelte"; // Importing the Button component

    let username = "";
    let password = "";

    function handleLogin(event) {
        event.preventDefault(); // Prevent the default form submission behavior
        console.log("Logging in with", username, password);
        // TODO: Add your login logic here
    }
</script>

<h1 class="text-3xl font-bold strikethrough">Log in</h1>

<!-- Form element to wrap the inputs -->
<form on:submit={handleLogin} class="p-4">
    <TextInput 
        placeholder="Username" 
        bind:value={username} 
        type=""
    />
    <PasswordInput 
        placeholder="Type your password here" 
        bind:value={password} 
    />
    
    <div class="flex items-center justify-between mt-4">
        <!-- Use the Button component here -->
        <Button 
            label="Log in" 
            onClick={handleLogin} 
            type="submit"
        />
        
        <!-- Underlined anchor tag for registration -->
        <a href="/register" class="text-tertiary underline hover:text-secondary transition duration-150 ease-in-out">
            Register
        </a>
    </div>
</form>
