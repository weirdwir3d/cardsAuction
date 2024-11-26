import express from 'express'
import usersData from '../../../db/usersData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
const router = express.Router();
import httpErrors from 'http-errors'

// GET all users
router.get("/", async (req, res) => {
    res.json({ usersData })
    
    if (!usersData) {
        res.json({
            error: "no users"
        })
    }
})

// GET one user
router.get("/:id", async (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundUser = usersData.find(user => user.id === wantedId)
    console.log('found id:', wantedId, 'foud user:', foundUser)
    res.json({foundUser})
})

// DELETE one user
router.delete('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundUser = usersData.find(user => user.id === wantedId);

    if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
    }

    let removedUser;
    const index = usersData.indexOf(foundUser);
    if (index > -1) {
        removedUser = usersData.splice(index, 1);
    }

    if (!removedUser) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.status(202).json({ error: "User deleted: " + JSON.stringify(removedUser) });
});

export default router;