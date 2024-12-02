import jwt from 'jsonwebtoken';
import express from 'express';

export function isLoggedIn(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
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
    // get token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //get Bearer

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            error: "Unauthorized: No token provided"
        });
    }

    // verify token
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                error: "Unauthorized: Invalid token"
            });
        }

        req.user = decoded;

        // check if the user is an admin
        if (req.user && req.user.isAdmin === true) {
            next();
        } else {
            return res.status(403).json({
                error: 'Access denied'
            });
        }
    });
}