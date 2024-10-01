<h1>Cards</h1>

<script>
    async function retrieveCards() {
        console.log('retrieving cards...')

    try {
      const response = await fetch("http://localhost:3000/cards", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();
      console.log("Received response from server:", data);

    //   if (data.httpStatusCode === 200) {
    //     console.log("Login successful, updating token store");
    //     tokenStore.set({ token: data.token });

    //     tokenStore.subscribe((value) => {
    //       console.log("Token stored in tokenStore:", value.token);
    //       isLoggedIn = checkLoggedIn(value.token);
    //       isAdmin = isLoggedIn && checkIsAdmin(value.token);

    //       const decodedToken = JSON.parse(atob(value.token.split(".")[1]));
    //       username = decodedToken.username || "User";
    //     })();

    //     // Set success message
    //     alertMessage = "Login successful!";
    //     alertType = "success";
    //     isAlertVisible = true;
    //   } else {
    //     handleLoginError(data);
    //   }
    } catch (error) {
      console.error("Error logging in:", error);
      alertMessage = "An unexpected error occurred. Please try again later.";
      alertType = "error";
      isAlertVisible = true;
    }
    }
</script>