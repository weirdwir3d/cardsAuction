import express from 'express';
import auctionsData from '../../../db/auctionsData.json' assert { type: 'json' };
import cardsData from '../../../db/cardsData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
const router = express.Router();

// Edit an auction
router.put('/:id', middleware.isAdmin, (req, res) => {
    const auctionId = parseInt(req.params.id);
    const updatedAuction = req.body;

    let foundAuction = auctionsData.find(auction => auction.id === auctionId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    const basePrice = updatedAuction.basePrice || foundAuction.basePrice;
    const publishedDateTime = updatedAuction.publishedDateTime || foundAuction.publishedDateTime;
    const endDateTime = updatedAuction.endDateTime || foundAuction.endDateTime;

    // Validation for base price
    if (basePrice <= 0) {
        return res.status(403).json({ error: "Base price cannot be zero or less" });
    }

    // Validation for dates
    if (!isValidDateTime(publishedDateTime)) {
        return res.status(400).json({ error: "Invalid published date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    if (!isValidDateTime(endDateTime)) {
        return res.status(400).json({ error: "Invalid end date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDateTime = parseDate(publishedDateTime);
    const parsedEndDateTime = parseDate(endDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0); // Set currentDate to the start of the second

    if (parsedPublishedDateTime < currentDateTime) {
        return res.status(400).json({ error: "Published date cannot be in the past." });
    }

    if (parsedEndDateTime <= parsedPublishedDateTime) {
        return res.status(400).json({ error: "End date must be after the published date." });
    }

    // Update the auction with the new details
    foundAuction.basePrice = basePrice;
    foundAuction.publishedDateTime = publishedDateTime;
    foundAuction.endDateTime = endDateTime;

    // Respond with a success message
    res.status(200).json({
        message: "Auction updated successfully!",
        updatedAuction: foundAuction
    });
});

// GET one auction
router.get("/:id", async (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundCard = auctionsData.find(card => card.id === wantedId);
    console.log('found id:', wantedId, 'found card:', foundCard);
    res.json({ foundCard });
});

// Create a new auction
router.post('/', middleware.isAdmin, (req, res) => {
    const auction = req.body;

    let cardId = parseInt(auction.cardId);
    let foundAuction = auctionsData.find(auction => auction.cardId === cardId);

    if (foundAuction) {
        return res.status(400).json({ error: "There is already an auction active for that card" });
    }

    const basePrice = auction.basePrice;
    const publishedDateTime = auction.publishedDateTime;
    const endDateTime = auction.endDateTime;

    if (basePrice <= 0) {
        return res.status(403).json({ error: "Base price cannot be zero or less" });
    }

    if (!isValidDateTime(publishedDateTime)) {
        return res.status(400).json({ error: "Invalid published date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    if (!isValidDateTime(endDateTime)) {
        return res.status(400).json({ error: "Invalid end date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDateTime = parseDate(publishedDateTime);
    const parsedEndDateTime = parseDate(endDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0); // Set currentDate to the start of the second

    if (parsedPublishedDateTime < currentDateTime) {
        return res.status(400).json({ error: "Published date cannot be in the past." });
    }

    if (parsedEndDateTime <= parsedPublishedDateTime) {
        return res.status(400).json({ error: "End date must be after the published date." });
    }

    let sortedAuctions = auctionsData.sort(function (a, b) {
        return (a.id - b.id);
    });
    let highestId = (sortedAuctions.length > 0) ? sortedAuctions[sortedAuctions.length - 1].id : -1;

    auctionsData.push({
        id: highestId + 1,
        cardId: auction.cardId,
        publishedDateTime: auction.publishedDateTime,
        endDateTime: auction.endDateTime,
        basePrice: auction.basePrice
    });

    res.status(200).json({
        message: "Auction added successfully!"
    });
});

// Helper function to convert "dd-mm-yyyy hh:mm:ss" format to a Date object
function parseDate(dateString) {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart ? timePart.split(":").map(Number) : [0, 0, 0];

    return new Date(year, month - 1, day, hours, minutes, seconds);
}

// Helper function to validate the date and time format "dd-mm-yyyy hh:mm:ss"
function isValidDateTime(dateString) {
    const regex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, seconds);

    return date && date.getDate() === day && (date.getMonth() + 1) === month && date.getFullYear() === year
        && date.getHours() === hours && date.getMinutes() === minutes && date.getSeconds() === seconds;
}

router.get("/", async (req, res) => {
    const { active, search, type, rarity, price, sort, order } = req.query;
    const currentDate = new Date();

    let auctions = auctionsData;

    // Filter active auctions
    if (active === "true") {
        auctions = auctions.filter(auction => {
            const publishedDate = parseDate(auction.publishedDateTime);
            const endDate = parseDate(auction.endDateTime);
            return currentDate >= publishedDate && currentDate <= endDate;
        });
    }

    // Search auctions by card name
    if (search) {
        const searchLower = search.toLowerCase();
        const filteredCards = cardsData.filter(card => card.name.toLowerCase().includes(searchLower));
        const filteredCardIds = filteredCards.map(card => card.id);
        auctions = auctions.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // Filter auctions by card type
    if (type) {
        const filteredCards = cardsData.filter(card => card.type === type);
        const filteredCardIds = filteredCards.map(card => card.id);
        auctions = auctions.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // Filter auctions by card rarity
    if (rarity) {
        const filteredCards = cardsData.filter(card => card.rarity === rarity);
        const filteredCardIds = filteredCards.map(card => card.id);
        auctions = auctions.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // Filter by price range (gte and lte)
    if (price) {
        const [operator, value] = price.split(':');
        const priceValue = parseInt(value);

        if (operator === 'gte') {
            auctions = auctions.filter(auction => auction.basePrice >= priceValue);
        } else if (operator === 'lte') {
            auctions = auctions.filter(auction => auction.basePrice <= priceValue);
        }
    }

    // Sorting logic
    if (sort) {
        if (sort === 'price') {
            auctions.sort((a, b) => (order === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice));
        } else if (sort === 'publishedDateTime') {
            auctions.sort((a, b) => {
                const dateA = parseDate(a.publishedDateTime);
                const dateB = parseDate(b.publishedDateTime);
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            });
        } else if (sort === 'endDateTime') {
            auctions.sort((a, b) => {
                const dateA = parseDate(a.endDateTime);
                const dateB = parseDate(b.endDateTime);
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            });
        }
    }

    // If no auctions or no matching auctions are found, return a message
    if (auctions.length === 0) {
        return res.json({ error: "No auctions found" });
    }

    // Return the filtered and sorted auctions
    return res.json({ auctions });
});

// Delete an auction
router.delete('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundAuction = auctionsData.find(auction => auction.id === wantedId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    let removedAuction;
    const index = auctionsData.indexOf(foundAuction);
    if (index > -1) {
        removedAuction = auctionsData.splice(index, 1);
    }

    if (!removedAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    return res.status(202).json({ error: "Auction deleted: " + JSON.stringify(removedAuction) });
});

export default router;
