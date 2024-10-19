import { tokenStore } from './TokenStore';
import { jwtDecode } from 'jwt-decode'; // Ensure proper import

let decodedToken = null;

const unsubscribe = tokenStore.subscribe(value => {
    if (value.token) {
        try {
            decodedToken = jwtDecode(value.token);
            console.log('Decoded Token:', decodedToken); // Log the decoded token
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    } else {
        decodedToken = null;
    }
});

export function checkIsAdmin() {
    return decodedToken && decodedToken.isAdmin;
}

export function checkLoggedIn() {
    return !!decodedToken;
}

// New function to get user ID
export function getUserId() {
    return decodedToken ? decodedToken.id : null; // Assuming 'id' is the key in the token
}

export function getUsername() {
    return decodedToken ? decodedToken.username : null; // Assuming 'id' is the key in the token
}

export function getEmail() {
    return decodedToken ? decodedToken.email : null; // Assuming 'id' is the key in the token
}