import express from 'express';
import auctions from '../../../db/auctionsData.json' assert { type: 'json' };
import cards from '../../../db/cardsData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
import { parseDateTime, isValidDateTime } from '../helper.js'
const router = express.Router();

//edit auction
router.put('/:id', middleware.isAdmin, (req, res) => {
    const auctionId = parseInt(req.params.id);
    const auctionToUpdate = req.body;

    let foundAuction = auctions.find(auction => auction.id === auctionId);
    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    if (auctionToUpdate.basePrice !== foundAuction.basePrice) {
        if (auctionToUpdate.basePrice <= 0) {
            return res.status(400).json({ error: "Base price cannot be zero or less" });
        }
        foundAuction.basePrice = auctionToUpdate.basePrice;
    }

    if (!isValidDateTime(auctionToUpdate.publishedDateTime)) {
        return res.status(400).json({ error: "Published date must be in the format 'dd-mm-yyyy hh:mm:ss'" });
    }

    if (auctionToUpdate.endDateTime && !isValidDateTime(auctionToUpdate.endDateTime)) {
        return res.status(400).json({ error: "End date must be in the format 'dd-mm-yyyy hh:mm:ss'" });
    }

    const parsedPublishedDateTime = parseDateTime(auctionToUpdate.publishedDateTime);
    const parsedEndDateTime = parseDateTime(auctionToUpdate.endDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0);

    if (auctionToUpdate.publishedDateTime !== foundAuction.publishedDateTime) {
        if (parsedPublishedDateTime < currentDateTime) {
            return res.status(400).json({ error: "Published date cannot be in the past" });
        }
        foundAuction.publishedDateTime = auctionToUpdate.publishedDateTime;
    }

    if (auctionToUpdate.endDateTime !== foundAuction.endDateTime) {
        if (parsedEndDateTime <= parsedPublishedDateTime) {
            return res.status(400).json({ error: "End date cannot be before published date" });
        }
        foundAuction.endDateTime = auctionToUpdate.endDateTime;
    }

    res.status(200).json({
        message: "Auction updated successfully!",
        auction: foundAuction
    });
});


// GET one auction by ID
router.get("/:id", async (req, res) => {
    try {
        const auctionId = parseInt(req.params.id);

        if (isNaN(auctionId)) {
            return res.status(400).json({ error: "Auction id must be a number!" });
        }

        const auction = auctions.find(auction => auction.id === auctionId);

        if (!auction) {
            return res.status(404).json({ error: "Auction not found" });
        }

        res.status(200).json({ auction: auction });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST new auction
router.post('/', middleware.isAdmin, (req, res) => {
    const auction = req.body;

    if (!auction.cardId) {
        return res.status(400).json({ error: "No card selected" });
    }

    let cardId = parseInt(auction.cardId);

    let foundAuction = auctions.find(existingAuction => existingAuction.cardId === cardId);
    if (foundAuction) {
        return res.status(409).json({ error: "There is already an auction active for that card" });
    }

    const basePrice = auction.basePrice;
    const publishedDateTime = auction.publishedDateTime;
    const endDateTime = auction.endDateTime;

    if (basePrice <= 0) {
        return res.status(400).json({ error: "Base price cannot be zero or less" });
    }

    if (!isValidDateTime(publishedDateTime)) {
        return res.status(400).json({ error: "Invalid published date format. It must be 'dd-mm-yyyy hh:mm:ss'" });
    }

    if (!isValidDateTime(endDateTime)) {
        return res.status(400).json({ error: "Invalid end date or time." });
    }

    const parsedPublishedDateTime = parseDateTime(publishedDateTime);
    const parsedEndDateTime = parseDateTime(endDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0);

    if (parsedPublishedDateTime < currentDateTime) {
        return res.status(400).json({ error: "Published date cannot be in the past" });
    }

    if (parsedEndDateTime <= parsedPublishedDateTime) {
        return res.status(400).json({ error: "You cannot post an auction in the past" });
    }

    let sortedAuctions = auctions.sort(function (a, b) {
        return (a.id - b.id);
    });
    let highestId = (sortedAuctions.length > 0) ? sortedAuctions[sortedAuctions.length - 1].id : -1;

    const newAuction = {
        id: highestId + 1,
        cardId: auction.cardId,
        publishedDateTime: auction.publishedDateTime,
        endDateTime: auction.endDateTime,
        basePrice: auction.basePrice
    };

    auctions.push(newAuction);

    // update the card with the auctionId
    let foundCard = cards.find(card => card.id === cardId);
    if (foundCard) {
        foundCard.auctionId = newAuction.id;
    } else {
        return res.status(404).json({ error: "Card not found" });
    }

    res.status(200).json({
        message: "Auction added successfully!",
        auction: newAuction
    });
});

//GET all auctions
router.get("/", async (req, res) => {
    const { search, type, rarity, price } = req.query;

    let auctionResults = auctions;

    //search auctions by card name
    if (search) {
        const searchLowerCase = search.toLowerCase();
        const filteredCards = cards.filter(card => card.name.toLowerCase().includes(searchLowerCase));
        const filteredCardIds = filteredCards.map(card => card.id);
        auctionResults = auctionResults.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // filter auctions by card type
    if (type) {
        const filteredCards = cards.filter(card => card.type === type);
        const filteredCardIds = filteredCards.map(card => card.id);
        auctionResults = auctionResults.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // filter auctions by card rarity
    if (rarity) {
        const filteredCards = cards.filter(card => card.rarity === rarity);
        const filteredCardIds = filteredCards.map(card => card.id);
        auctionResults = auctionResults.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // filter by max price
    if (price) {
        const [operator, value] = price.split(':');
        const priceValue = parseInt(value);

        if (operator === 'lte') {
            auctionResults = auctionResults.filter(auction => auction.basePrice <= priceValue);
        }
    }

    return res.status(200).json({ auctions: auctionResults });
});

// delete auction
router.delete('/:id', middleware.isAdmin, (req, res) => {
    const auctionId = parseInt(req.params.id);
    let foundAuction = auctions.find(auction => auction.id === auctionId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    const index = auctions.indexOf(foundAuction);
    if (index > -1) {
        auctions.splice(index, 1);
    }

    //after removing auction, find card linked to auction and set its auctionId to -1
    const foundCard = cards.find(card => card.auctionId === auctionId);
    if (foundCard) {
        foundCard.auctionId = -1;
    } else {
        return res.status(404).json({ error: "Card not found" });
    }

    return res.status(200).json({
        message: 'Auction deleted successfully!',
        auction: foundAuction
    });
});

export default router;