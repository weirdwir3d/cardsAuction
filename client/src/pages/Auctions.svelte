<!-- <script>console.log('token:', sessionStorage.getItem('token'))</script> -->
<script>
        import { tokenStore } from '../TokenStore'; // Import the tokenStore
            tokenStore.subscribe(value => {
            console.log('AUCTIONS PG Token stored in tokenStore:', value.token); // Log the token from TokenStore
        })();
</script>
<h1>Auctions</h1>