import express from 'express';
import auctionsData from '../../../db/auctionsData.json' assert { type: 'json' };
import cardsData from '../../../db/cardsData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
import { parseDateTime, isValidDateTime } from '../utils.js'
const router = express.Router();

router.put('/:id', middleware.isAdmin, (req, res) => {
    const auctionId = parseInt(req.params.id);
    const auctionToUpdate = req.body;

    let foundAuction = auctionsData.find(auction => auction.id === auctionId);
    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found", message: "The specified auction does not exist." });
    }

    if (auctionToUpdate.basePrice != foundAuction.basePrice) {
        if (auctionToUpdate.basePrice <= 0) {
            return res.status(403).json({ error: "Base price cannot be zero or less", message: "Base price must be greater than zero." });
        }
        foundAuction.basePrice = auctionToUpdate.basePrice;
    }

    if (!isValidDateTime(auctionToUpdate.publishedDateTime)) {
        return res.status(400).json({ error: "Invalid published date format", message: "Published date must be in the format 'dd-mm-yyyy hh:mm:ss'." });
    }

    if (auctionToUpdate.endDateTime && !isValidDateTime(auctionToUpdate.endDateTime)) {
        return res.status(400).json({ error: "Invalid end date format", message: "End date must be in the format 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDateTime = parseDateTime(auctionToUpdate.publishedDateTime);
    const parsedEndDateTime = parseDateTime(auctionToUpdate.endDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0);

    if (auctionToUpdate.publishedDateTime != foundAuction.publishedDateTime) {
        if (parsedPublishedDateTime < currentDateTime) {
            return res.status(400).json({ error: "Published date in the past", message: "Published date cannot be earlier than the current date and time." });
        }
        foundAuction.publishedDateTime = auctionToUpdate.publishedDateTime;
    }

    if (auctionToUpdate.endDateTime != foundAuction.endDateTime) {
        if (parsedEndDateTime <= parsedPublishedDateTime) {
            return res.status(400).json({ error: "End date before published date", message: "End date must be later than the published date." });
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
            return res.status(400).json({ error: "Auction id must be a number." });
        }

        const auction = auctionsData.find(auction => auction.id === auctionId);

        if (!auction) {
            return res.status(404).json({ error: "Auction not found" });
        }

        // console.log('Requested auction ID:', auctionId, 'Auction details:', auction);

        res.status(200).json(auction);

    } catch (error) {
        console.error('Error retrieving auction:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST new auction
router.post('/', middleware.isAdmin, (req, res) => {
    const auction = req.body;

    // console.log('Received auction data:', auction);

    if (!auction.cardId) {
        return res.status(400).json({ error: "No card selected" });
    }

    let cardId = parseInt(auction.cardId);
    // console.log('Parsed cardId:', cardId);

    let foundAuction = auctionsData.find(existingAuction => existingAuction.cardId === cardId);
    if (foundAuction) {
        console.log('Found existing auction for cardId:', cardId);
        return res.status(409).json({ error: "There is already an auction active for that card." });
    }

    const basePrice = auction.basePrice;
    const publishedDateTime = auction.publishedDateTime;
    const endDateTime = auction.endDateTime;

    // console.log('base Price:', basePrice);
    // console.log('publishedDateTime:', publishedDateTime);
    // console.log('endDateTime:', endDateTime);

    if (basePrice <= 0) {
        // console.error('Base price invalid:', basePrice);
        return res.status(403).json({ error: "Base price cannot be zero or less." });
    }

    if (!isValidDateTime(publishedDateTime)) {
        // console.error('Invalid published date format:', publishedDateTime);
        return res.status(400).json({ error: "Invalid published date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    if (!isValidDateTime(endDateTime)) {
        // console.error('Invalid end date format:', endDateTime);
        return res.status(400).json({ error: "Invalid end date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDateTime = parseDateTime(publishedDateTime);
    const parsedEndDateTime = parseDateTime(endDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0);

    // console.log('parsed publishedDateTime:', parsedPublishedDateTime);
    // console.log('parsed endDateTime:', parsedEndDateTime);
    // console.log('current datetime:', currentDateTime);

    if (parsedPublishedDateTime < currentDateTime) {
        console.error('Published date is in the past:', parsedPublishedDateTime);
        return res.status(400).json({ error: "Published date cannot be in the past." });
    }

    if (parsedEndDateTime <= parsedPublishedDateTime) {
        console.error('End date is not after the published date:', parsedEndDateTime, parsedPublishedDateTime);
        return res.status(400).json({ error: "You cannot post an auction in the past." });
    }

    let sortedAuctions = auctionsData.sort(function (a, b) {
        return (a.id - b.id);
    });
    let highestId = (sortedAuctions.length > 0) ? sortedAuctions[sortedAuctions.length - 1].id : -1;

    // console.log('Highest Auction ID:', highestId);

    const newAuction = {
        id: highestId + 1,
        cardId: auction.cardId,
        publishedDateTime: auction.publishedDateTime,
        endDateTime: auction.endDateTime,
        basePrice: auction.basePrice
    };

    auctionsData.push(newAuction);

    // console.log('Auction added successfully:', newAuction);

    // update the card with the auctionId
    let foundCard = cardsData.find(card => card.id === cardId);
    if (foundCard) {
        foundCard.auctionId = newAuction.id;
        console.log('Card updated with auctionId:', foundCard);
    } else {
        console.error('Card not found for cardId:', cardId);
        return res.status(404).json({ error: "Card not found" });
    }

    res.status(201).json({
        message: "Auction added successfully!",
        auction: newAuction
    });
});

router.get("/", async (req, res) => {
    const { search, type, rarity, price } = req.query;
    const currentDate = new Date();

    let auctions = auctionsData;

    //search auctions by card name
    if (search) {
        // console.log('filtering auctions by card name...')
        const searchLowerCase = search.toLowerCase();
        const filteredCards = cardsData.filter(card => card.name.toLowerCase().includes(searchLowerCase));
        const filteredCardIds = filteredCards.map(card => card.id);
        auctions = auctions.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // filter auctions by card type
    if (type) {
        // console.log('filtering auctions by type')
        // console.log('type:', type)
        // console.log('cardsData:', cardsData)
        // console.log('cards types:', cardsData.map(card => card.type))
        const filteredCards = cardsData.filter(card => card.type === type);
        // console.log('filtered cards:', filteredCards)
        const filteredCardIds = filteredCards.map(card => card.id);
        auctions = auctions.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // filter auctions by card rarity
    if (rarity) {
        // console.log('filtering auctions by rarity')
        // console.log('cards raritis:', cardsData.map(card => card.rarity))
        const filteredCards = cardsData.filter(card => card.rarity === rarity);
        const filteredCardIds = filteredCards.map(card => card.id);
        auctions = auctions.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // filter by max price
    if (price) {
        // console.log('filtering auctions by price')
        const [operator, value] = price.split(':');
        const priceValue = parseInt(value);

        if (operator === 'lte') {
            auctions = auctions.filter(auction => auction.basePrice <= priceValue);
        }
    }

    if (auctions.length == 0) {
        return res.status(404).json({ error: "No auctions found" });
    }

    return res.status(200).json({ auctions });
});

// delete auction
router.delete('/:id', middleware.isAdmin, (req, res) => {
    const auctionId = parseInt(req.params.id);
    let foundAuction = auctionsData.find(auction => auction.id === auctionId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    const index = auctionsData.indexOf(foundAuction);
    if (index > -1) {
        auctionsData.splice(index, 1);
    }

    //after removing auction, find card linked to auction and set its auctionId to -1
    const foundCard = cardsData.find(card => card.auctionId === auctionId);
    if (foundCard) {
        foundCard.auctionId = -1;
        // console.log(`auctionId set to -1`);
    } else {
        console.log(`No card found linked to auction ID ${auctionId}`);
    }

    return res.status(200).json({
        message: `Auction deleted successfully`,
        removedAuction: foundAuction,
        updatedCard: foundCard || null
    });
});

export default router;