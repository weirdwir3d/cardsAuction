import express from 'express';
import jwt from 'jsonwebtoken'
import usersData from '../../../db/usersData.json' assert { type: 'json' };
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import * as middleware from '../middleware/middleware.js';
const router = express.Router();

dotenv.config();

router.post("/register", async (req, res) => {
    let { password, confirmPassword, email, isAdmin, username } = req.body;

    //check if passwords are the same
    if (password !== confirmPassword) {
        return res.json({
            httpStatusCode: 401,
            message: "Passwords don't match"
        })
    }

    let foundUser = usersData.find(user => user.email === email);
    //register if email is unused
    if (!foundUser) {
        try {
            let hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

            var sortedUsers = usersData.sort(function (a, b) {
                return (a.id - b.id);
            });

            console.log(hashedPassword)
            let highestId = 0
            try {
                highestId = sortedUsers[sortedUsers.length - 1].id;
            } catch {
                highestId = 0
            }

            console.log('highest id', highestId)
            usersData.push({
                id: (highestId === 0 ? 0 : highestId + 1),
                username: req.body.username,
                email: email,
                password: hashedPassword,
                isAdmin: (isAdmin ? true : false)
            })

            await login(req, res)

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
        })
    }
});

router.post("/login", async (req, res) => {
    await login(req, res)
});

router.post("/logout", middleware.isLoggedIn, async (req, res) => {
    res.cookie('authToken', '', {
        httpOnly: true,
        maxAge: 0
    })

    return res.json({
        httpStatusCode: 200,
        message: "Logged out succesfully"
    })
})

async function login(req, res) {
    console.log('trying to log in')
    let email = req.body.email;
    let password = req.body.password;

    let foundUser = usersData.find(user => user.email === email);

    console.log(`found user: ${JSON.stringify(foundUser)}`)

    //find user
    if (foundUser) {

        let isPasswordValid = await bcrypt.compare(password, foundUser.password);

        if (isPasswordValid) {
            jwt.sign(foundUser, process.env.SECRET, { expiresIn: '1h' }, (err, token) => {
                console.log('signing')
                if (err) {
                    console.log(err);
                    return res.json({
                        httpStatusCode: 500,
                        message: "Server error while logging in, please contact admin",
                        token: token
                    })
                }
                
                // set cookie in http response
                res.cookie('authToken', token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000, // 1h
                });

                console.log('logged in')
                return res.json({
                    httpStatusCode: 200,
                    message: "Logged in successfully",
                    token: token
                })
            });
        } else {
            console.log('wromg password');
            return res.json({
                httpStatusCode: 401,
                message: "Wrong password"
            })
        }

    } else {
        console.log('user not found');
        return res.json({
            httpStatusCode: 404,
            message: "User not found"
        })
    }
}

export default router;