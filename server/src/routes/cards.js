import express from 'express';
import cards from '../../../db/cardsData.json' assert { type: 'json' };
import auctions from '../../../db/auctionsData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
const router = express.Router();

// edit card
router.put('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);

    let foundCard = cards.find(card => card.id === wantedId);

    if (!foundCard) {
        return res.status(404).json({ error: "Card not found" });
    }

    const updatedCard = req.body;

    if (updatedCard.name && updatedCard.name.length < 4) {
        return res.status(400).json({
            error: "Card name is too short!"
        });
    }

    if (updatedCard.description === undefined || updatedCard.description.trim() === "") {
        return res.status(400).json({ error: "Card description is required!" });
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
    foundCard.name = updatedCard.name;
    foundCard.description = updatedCard.description;
    foundCard.type = updatedCard.type;
    foundCard.rarity = updatedCard.rarity;
    foundCard.imageUrl = updatedCard.imageUrl;
    foundCard.auctionId = updatedCard.auctionId;

    res.status(200).json({
        message: "Card updated successfully!",
        card: foundCard
    });
});


//GET one card
router.get("/:id", (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = cards.find(card => card.id === wantedId);

    if (!foundCard) {
        return res.status(404).json({ error: "Card not found" });
    }

    res.status(200).json({ card: foundCard });
});

// POST new card
router.post('/', middleware.isAdmin, (req, res) => {
    const card = req.body;

    if (card.name.length < 4) {
        return res.status(400).json({ error: "Card name is too short!" });
    }

    if (card.description.length < 10) {
        return res.status(400).json({ error: "Card description is too short!" });
    }

    if (!["monster", "trap", "spell"].includes(card.type)) {
        return res.status(400).json({ error: `Card type has to be either "monster", "trap" or "spell".` });
    }

    if (!["rare", "super rare", "ultra rare", "unique"].includes(card.rarity)) {
        return res.status(400).json({ error: `Card rarity has to be either "rare", "super rare", "ultra rare" or "unique".` });
    }

    if (!card.imageUrl.startsWith("http") || (!card.imageUrl.endsWith(".jpg") && !card.imageUrl.endsWith(".png"))) {
        return res.status(400).json({ error: `Please provide a valid image link (starting with "http" and ending with ".jpg" or ".png").` });
    }

    if (typeof card.auctionId !== 'number' || card.auctionId < -1) {
        return res.status(400).json({ error: "Auction ID must be a non-negative integer or -1." });
    }

    let sortedCards = cards.sort((a, b) => a.id - b.id);
    let highestId = (sortedCards.length > 0) ? sortedCards[sortedCards.length - 1].id : -1;

    const newCard = {
        id: highestId + 1,
        name: card.name,
        description: card.description,
        type: card.type,
        rarity: card.rarity,
        imageUrl: card.imageUrl,
        auctionId: card.auctionId || -1
    };

    cards.push(newCard);

    res.status(200).json({
        message: "Card added successfully!",
        card: newCard
    });
});


//get all cards
router.get("/", async (req, res) => {
    return res.status(200).json({ cards });
});

//delete a card
router.delete('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = cards.find(card => card.id === wantedId);

    if (!foundCard) {
        return res.status(404).json({ error: "Card not found" });
    }

    const index = cards.indexOf(foundCard);
    if (index > -1) {
        cards.splice(index, 1);
    }

    //delete associated auction
    let foundAuction = auctions.find(auction => auction.cardId === wantedId)
    let removedAuction;
    const auctionIndex = auctions.indexOf(foundAuction);
    if (auctionIndex > -1) {
        removedAuction = auctions.splice(auctionIndex, 1);

        if (!removedAuction) {
            return res.status(404).json({ error: "Auction not found" });
        }
    }

    return res.status(200).json({ message: "Card deleted successfully!", card: foundCard });
});

export default router;
