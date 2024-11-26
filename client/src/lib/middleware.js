import { tokenStore } from './TokenStore';
import { jwtDecode } from 'jwt-decode';

let decodedToken = null;

tokenStore.subscribe(value => {
    if (value.token) {
        try {
            decodedToken = jwtDecode(value.token);
            // console.log('decoded token:', decodedToken);
        } catch (error) {
            console.error('error decoding token:', error);
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

export function getUserId() {
    if (decodedToken) {
        return decodedToken.id
    }
    return null;
}

export function getUsername() {
    return decodedToken ? decodedToken.username : null;
}

export function getEmail() {
    return decodedToken ? decodedToken.email : null;
}