import express from 'express';
import cardsData from '../../../db/cardsData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
const router = express.Router();


// add a new card
router.post('/', middleware.isAdmin, (req, res) => {
    console.log("after middleware")
    const card = req.body;
    res.status(200).json({
        message: "hi admin!"
    })
})

// get all cards
router.get("/", async (req, res) => {
    res.json({ cardsData })

    if (!cardsData) {
        res.json({
            error: "no cards"
        })
    }
})

export default router;