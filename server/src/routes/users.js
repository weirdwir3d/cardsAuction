import express from 'express'
import usersData from '../../../db/usersData.json' assert { type: 'json' };
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

export default router;