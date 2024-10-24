import express from 'express';
import jwt from 'jsonwebtoken';
import usersData from '../../../db/usersData.json' assert { type: 'json' };
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import * as middleware from '../middleware/middleware.js';

const router = express.Router();
dotenv.config();

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

router.post("/register", async (req, res) => {
    let { password, confirmPassword, email, username } = req.body;

    // Validate if password is not empty
    if (!password) {
        return res.json({
            httpStatusCode: 400,
            message: "Password cannot be empty"
        });
    }

    // Validate if passwords are the same
    if (password !== confirmPassword) {
        return res.json({
            httpStatusCode: 401,
            message: "Passwords don't match"
        });
    }

    // Validate email format
    if (!isValidEmail(email)) {
        return res.json({
            httpStatusCode: 400,
            message: "Invalid email format"
        });
    }

    // Validate username length (must be at least 4 characters)
    if (username.length < 4) {
        return res.json({
            httpStatusCode: 400,
            message: "Username must be at least 4 characters long"
        });
    }

    let foundUser = usersData.find(user => user.email === email);
    // Register if email is unused
    if (!foundUser) {
        try {
            let hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

            var sortedUsers = usersData.sort(function (a, b) {
                return (a.id - b.id);
            });

            console.log(hashedPassword);
            let highestId = (sortedUsers.length > 0) ? sortedUsers[sortedUsers.length - 1].id : -1;

            console.log('highest id', highestId);
            usersData.push({
                id: highestId + 1,
                username: req.body.username,
                email: email,
                password: hashedPassword,
                isAdmin: false
            });

            await login(req, res);

        } catch (err) {
            return res.json({
                httpStatusCode: 500,
                message: "Server error while registering, please contact admin"
            });
        }

    } else {
        return res.json({
            httpStatusCode: 409,
            message: "Email address already in use"
        });
    }
});

router.post("/login", async (req, res) => {
    await login(req, res);
});

router.post("/logout", middleware.isLoggedIn, async (req, res) => {
    res.cookie('authToken', '', {
        httpOnly: false,
        maxAge: 0
    });

    return res.json({
        httpStatusCode: 200,
        message: "Logged out successfully"
    });
});

async function login(req, res) {
    console.log('trying to log in');
    let email = req.body.email;
    let password = req.body.password;

    let foundUser = usersData.find(user => user.email === email);

    console.log(`found user: ${JSON.stringify(foundUser)}`);

    // Find user
    if (foundUser) {

        let isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (isPasswordValid) {
            jwt.sign(foundUser, process.env.SECRET, { expiresIn: '1h' }, (err, token) => {
                console.log('signing');
                if (err) {
                    console.log(err);
                    return res.json({
                        httpStatusCode: 500,
                        message: "Server error while logging in, please contact admin",
                        token: token
                    });
                }

                // Set cookie in HTTP response
                res.cookie('authToken', token, {
                    httpOnly: false,
                    SameSite: 'None',
                    maxAge: 60 * 60 * 1000, // 1h
                });

                console.log('logged in');
                return res.json({
                    httpStatusCode: 200,
                    message: "Logged in successfully",
                    token: token
                });
            });
        } else {
            console.log('wrong password');
            return res.json({
                httpStatusCode: 401,
                message: "Wrong password"
            });
        }

    } else {
        console.log('user not found');
        return res.json({
            httpStatusCode: 404,
            message: "User not found"
        });
    }
}

export default router;
