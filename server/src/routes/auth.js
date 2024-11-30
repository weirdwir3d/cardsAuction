import express from 'express';
import jwt from 'jsonwebtoken';
import usersData from '../../../db/usersData.json' assert { type: 'json' };
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import * as middleware from '../middleware/middleware.js';
import * as helper from '../helper.js'

const router = express.Router();
dotenv.config();

router.post("/register", async (req, res) => {
    let { password, confirmPassword, email, username } = req.body;

    // validate password not empty
    if (!password) {
        return res.status(400).json({
            error: "Password cannot be empty"
        });
    }

    // validate passwords are the same
    if (password !== confirmPassword) {
        return res.status(401).json({
            error: "Passwords don't match"
        });
    }

    // validate email format
    if (!helper.isValidEmail(email)) {
        return res.status(400).json({
            error: "Invalid email"
        });
    }

    // validate username at least 4 chars
    if (username.length < 4) {
        return res.status(400).json({
            error: "Username must be at least 4 characters long"
        });
    }

    let foundUser = usersData.find(user => user.email === email);
    // proceed with registering if email unused
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
            return res.status(500).json({
                error: "Server error while registering, please contact admin"
            });
        }

    } else {
        return res.status(409).json({
            error: "Email address already in use"
        });
    }
});

router.post("/login", async (req, res) => {
    await login(req, res);
});

//i googled it and apparently for logging out, POST is more used than DELETE
router.post("/logout", middleware.isLoggedIn, async (req, res) => {
    res.cookie('authToken', '', {
        httpOnly: false,
        maxAge: 0
    });

    return res.status(200).json({
        message: "Logged out successfully"
    });
});

async function login(req, res) {
    console.log('trying to log in');
    let email = req.body.email;
    let password = req.body.password;

    let foundUser = usersData.find(user => user.email === email);

    console.log(`found user: ${JSON.stringify(foundUser)}`);

    //Find user
    if (foundUser) {

        let isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (isPasswordValid) {
            jwt.sign(foundUser, process.env.SECRET, { expiresIn: '1h' }, (err, token) => {
                console.log('signing');
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: "Server error while generating token for log in, please contact admin",
                        token: token
                    });
                }

                //set cookie in response
                res.cookie('authToken', token, {
                    httpOnly: false,
                    SameSite: 'None',
                    maxAge: 60 * 60 * 1000, //1h
                });

                console.log(token)

                // console.log('logged in');
                return res.status(200).json({
                    message: "Logged in successfully",
                    token: token
                });
            });
        } else {
            console.log('wrong password');
            return res.status(401).json({
                error: "Wrong password"
            });
        }

    } else {
        console.log('user not found');
        return res.status(404).json({
            error: "No account associated to this email"
        });
    }
}

export default router;
