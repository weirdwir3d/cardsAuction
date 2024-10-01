import express from 'express';
import cardsData from '../../../db/cardsData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';

const router = express.Router();

// Edit a card
router.put('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = cardsData.find(card => card.id === wantedId);

    if (!foundCard) {
        return res.status(404).json({ error: "Card not found" });
    }

    const updatedCard = req.body;

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

    if (updatedCard.auctionId !== undefined && (typeof updatedCard.auctionId !== 'number' || updatedCard.auctionId < -1)) {
        return res.status(400).json({ error: "Auction ID must be a non-negative integer or -1." });
    }

    // Update card details
    foundCard.name = updatedCard.name || foundCard.name;
    foundCard.description = updatedCard.description || foundCard.description;
    foundCard.type = updatedCard.type || foundCard.type;
    foundCard.rarity = updatedCard.rarity || foundCard.rarity;
    foundCard.imageUrl = updatedCard.imageUrl || foundCard.imageUrl;
    foundCard.auctionId = updatedCard.auctionId !== undefined ? updatedCard.auctionId : foundCard.auctionId;

    res.status(200).json({
        message: "Card updated successfully!",
        card: foundCard
    });
});

// GET one card
router.get("/:id", async (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = cardsData.find(card => card.id === wantedId);
    res.json({ foundCard });
});

// Add a new card
router.post('/', middleware.isAdmin, (req, res) => {
    const card = req.body;

    if (card.name.length < 3) {
        return res.json({ error: "Card name is too short!" });
    }

    if (card.description.length < 10) {
        return res.json({ error: "Card description is too short!" });
    }

    if (!["monster", "trap", "spell"].includes(card.type)) {
        return res.json({ error: `Card type has to be either "monster", "trap" or "spell".` });
    }

    if (!["rare", "super rare", "ultra rare", "unique"].includes(card.rarity)) {
        return res.json({ error: `Card rarity has to be either "rare", "super rare", "ultra rare" or "unique".` });
    }

    if (!card.imageUrl.startsWith("http") || (!card.imageUrl.endsWith(".jpg") && !card.imageUrl.endsWith(".png"))) {
        return res.json({ error: `Please provide a valid image link (starting with "http" and ending with ".jpg" or ".png").` });
    }

    if (card.auctionId !== undefined && (typeof card.auctionId !== 'number' || card.auctionId < -1)) {
        return res.json({ error: "Auction ID must be a non-negative integer or -1." });
    }

    let sortedCards = cardsData.sort((a, b) => a.id - b.id);
    let highestId = (sortedCards.length > 0) ? sortedCards[sortedCards.length - 1].id : -1;

    cardsData.push({
        id: highestId + 1,
        name: card.name,
        description: card.description,
        type: card.type,
        rarity: card.rarity,
        imageUrl: card.imageUrl,
        auctionId: card.auctionId !== undefined ? card.auctionId : -1
    });

    res.status(200).json({
        message: "Card added successfully!"
    });
});

// Get all cards
router.get("/", async (req, res) => {
    if (!cardsData) {
        return res.json({ error: "no cards" });
    }
    res.json({ cardsData });
});

// Delete a card
router.delete('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = cardsData.find(card => card.id === wantedId);

    if (!foundCard) {
        return res.status(404).json({ error: "Card not found" });
    }

    const index = cardsData.indexOf(foundCard);
    if (index > -1) {
        cardsData.splice(index, 1);
    }

    return res.status(202).json({ message: "Card deleted successfully!" });
});

export default router;
