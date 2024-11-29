import express from 'express'
import users from '../../../db/usersData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
const router = express.Router();
import httpErrors from 'http-errors'

// GET all users
router.get("/", async (req, res) => {
    return res.status(200).json({ users });
})

// GET one user
router.get("/:id", async (req, res) => {
    let wantedId = parseInt(req.params.id);

    if (isNaN(wantedId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    let foundUser = users.find(user => user.id === wantedId);

    if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ foundUser });
})

// DELETE one user
router.delete('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    if (isNaN(wantedId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    let foundUser = users.find(user => user.id === wantedId);

    if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
    }

    let removedUser;
    const index = users.indexOf(foundUser);
    if (index > -1) {
        removedUser = users.splice(index, 1);
    }

    return res.status(202).json({ removedUser });
});

export default router;