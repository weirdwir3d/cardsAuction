import jwt from 'jsonwebtoken';
import express from 'express';

export function isLoggedIn(req, res, next) {
    console.log('is logged in??')
    const token = req.cookies.authToken;
    if (!token) {
        console.log('not logged in!')
        return res.json({
            httpStatusCode: 401,
            message: "Unauthorized: No token provided"
        });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.json({
                httpStatusCode: 401,
                message: "Unauthorized: Invalid token"
            });
        }
        req.user = decoded;
        next();
    });
}

export function isAdmin(req, res, next) {
    console.log('called middleware isAdmin function')
    // Extract token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Assuming "Bearer <token>"

    console.log('backend token:', token)

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            httpStatusCode: 401,
            message: "Unauthorized: No token provided"
        });
    }

    // Verify the token
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                httpStatusCode: 401,
                message: "Unauthorized: Invalid token"
            });
        }

        // Attach the decoded user data to the request object for further use
        req.user = decoded;

        // Check if the user is an admin
        if (req.user && req.user.isAdmin === true) {
            next();
        } else {
            return res.status(403).json({
                httpStatusCode: 403,
                message: 'Access denied'
            });
        }
    });
}