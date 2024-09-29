import { tokenStore } from './TokenStore';
import { jwtDecode } from 'jwt-decode'; // Ensure proper import

let decodedToken = null;

// Subscribe to tokenStore to track changes reactively
const unsubscribe = tokenStore.subscribe(value => {
    console.log('Current token value:', value.token); // Log current value

    if (value.token) {
        // Decode the token using jwt-decode
        decodedToken = jwtDecode(value.token);
        console.log('Decoded token:', decodedToken);
    } else {
        decodedToken = null;
    }
});

export function checkIsAdmin() {
    console.log('Checking if user is admin');
    console.log('Current decoded token:', decodedToken); // Log the decoded token

    if (!decodedToken || !decodedToken.isAdmin) {
        console.log('User is not admin');
        return false;
    }

    console.log('User is admin');
    return true;
}

export function checkLoggedIn() {
    console.log('Checking if user is logged in');
    console.log('Current decoded token:', decodedToken); // Log the decoded token
    if (!decodedToken) {
        console.log('No token found');
        return false;
    }
    console.log('User is logged in');
    return true;
}


// Clean up function if needed
function cleanup() {
    console.log('Cleaning up token subscription');
    unsubscribe();
}
