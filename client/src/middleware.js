import { tokenStore } from './TokenStore';
import { jwtDecode } from 'jwt-decode'; // Ensure proper import

let decodedToken = null;

const unsubscribe = tokenStore.subscribe(value => {
    if (value.token) {
        try {
            decodedToken = jwtDecode(value.token);
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    } else {
        decodedToken = null;
    }
});

export function checkIsAdmin() {
    if (!decodedToken || !decodedToken.isAdmin) {
        return false;
    }
    return true;
}

export function checkLoggedIn() {
    return !!decodedToken;
}
