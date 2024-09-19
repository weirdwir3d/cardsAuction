import express from 'express';
import cardsData from '../../../db/cardsData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
import { stringify } from 'mocha/lib/utils.js';
const router = express.Router();


// edit a card
router.put('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = cardsData.find(card => card.id === wantedId);

    if (!foundCard) {
        return res.status(404).json({ error: "Card not found" });
    }

    const updatedCard = req.body;

    // Validate card fields (similar to POST validation)
    if (updatedCard.name && updatedCard.name.length < 3) {
        return res.status(400).json({ error: "Card name is too short!" });
    }

    if (updatedCard.description && updatedCard.description.length < 10) {
        return res.status(400).json({ error: "Card description is too short!" });
    }

    if (updatedCard.type && !["monster", "trap", "spell"].includes(updatedCard.type)) {
        return res.status(400).json({ error: `Card type has to be either "monster", "trap" or "spell".` });
    }

    if (updatedCard.rarity && !["rare", "super rare", "ultra rare", "unique"].includes(updatedCard.rarity)) {
        return res.status(400).json({ error: `Card rarity has to be either "rare", "super rare", "ultra rare" or "unique".` });
    }

    if (updatedCard.imageUrl && (!updatedCard.imageUrl.startsWith("http") || (!updatedCard.imageUrl.endsWith(".jpg") && !updatedCard.imageUrl.endsWith(".png")))) {
        return res.status(400).json({ error: `Please provide a valid image link (starting with "http" and ending with ".jpg" or ".png").` });
    }

    // Update card details
    foundCard.name = updatedCard.name || foundCard.name;
    foundCard.description = updatedCard.description || foundCard.description;
    foundCard.type = updatedCard.type || foundCard.type;
    foundCard.rarity = updatedCard.rarity || foundCard.rarity;
    foundCard.imageUrl = updatedCard.imageUrl || foundCard.imageUrl;

    res.status(200).json({
        message: "Card updated successfully!",
        card: foundCard
    });
})

// GET one card
router.get("/:id", async (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = cardsData.find(card => card.id === wantedId)
    console.log('found id:', wantedId, 'foud card:', foundCard)
    res.json({ foundCard })
})

// add a new card
router.post('/', middleware.isAdmin, (req, res) => {
    const card = req.body;
    console.log("card body:" + JSON.stringify(card))

    if (card.name.length < 3) {
        res.json({
            error: "Card name is too short!"
        })
        return
    }

    if (card.description.length < 10) {
        res.json({
            error: "Card description is too short!"
        })
        return
    }

    if (card.type !== "monster" && card.type !== "trap" && card.type !== "spell") {
        res.json({
            error: `Card type has to be either "monster", "trap" or "spell".`
        })
        return
    }

    if (card.rarity !== "rare" && card.rarity !== "super rare" && card.rarity !== "ultra rare" && card.rarity !== "unique") {
        res.json({
            error: `Card rarity has to be either "rare", "super rare", "ultra rare" or "unique".`
        })
        return
    }

    if (!card.imageUrl.startsWith("http") && !card.imageUrl.endsWith(".jpg") && !card.imageUrl.endsWith(".png")) {
        res.json({
            error: `Please provide a valid image link (starting with "http" and ending with ".jpg" or ".png").`
        })
        return
    }

    let sortedCards = cardsData.sort(function (a, b) {
        return (a.id - b.id);
    });
    let highestId = (sortedCards.length > 0) ? sortedCards[sortedCards.length - 1].id : -1; 

    cardsData.push({
        id: highestId + 1,
        name: card.name,
        description: card.description,
        type: card.type,
        rarity: card.rarity,
        imageUrl: card.imageUrl
    })

    res.status(200).json({
        message: "Card added successfully!"
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

// delete a card
router.delete('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = cardsData.find(card => card.id === wantedId);

    if(!foundCard) {
        return res.status(404).json({ error: "Card not found" });
    }

    let removedCard;
    const index = cardsData.indexOf(foundCard);
    if (index > -1) {
        removedCard = cardsData.splice(index, 1);
    }

    if (!removedCard) {
        return res.status(404).json({ error: "Card not found" });
    }

    return res.status(202).json({ error: "Card deleted: " + JSON.stringify(removedCard) });
})

export default router;