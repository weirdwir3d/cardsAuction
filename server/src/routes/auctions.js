import express from 'express';
import auctionsData from '../../../db/auctionsData.json' assert { type: 'json' };
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
    const publishedDate = updatedAuction.publishedDate || foundAuction.publishedDate;
    const endDate = updatedAuction.endDate || foundAuction.endDate;

    // Validation for base price
    if (basePrice <= 0) {
        return res.status(403).json({ error: "Base price cannot be zero or less" });
    }

    // Validation for dates
    if (!isValidDate(publishedDate)) {
        return res.status(400).json({ error: "Invalid published date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    if (!isValidDate(endDate)) {
        return res.status(400).json({ error: "Invalid end date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDate = parseDate(publishedDate);
    const parsedEndDate = parseDate(endDate);
    const currentDate = new Date();
    currentDate.setMilliseconds(0); // Set currentDate to the start of the second

    if (parsedPublishedDate < currentDate) {
        return res.status(400).json({ error: "Published date cannot be in the past." });
    }

    if (parsedEndDate <= parsedPublishedDate) {
        return res.status(400).json({ error: "End date must be after the published date." });
    }

    // Update the auction with the new details
    foundAuction.basePrice = basePrice;
    foundAuction.publishedDate = publishedDate;
    foundAuction.endDate = endDate;

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
    const publishedDate = auction.publishedDate;
    const endDate = auction.endDate;

    if (basePrice <= 0) {
        return res.status(403).json({ error: "Base price cannot be zero or less" });
    }

    if (!isValidDate(publishedDate)) {
        return res.status(400).json({ error: "Invalid published date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    if (!isValidDate(endDate)) {
        return res.status(400).json({ error: "Invalid end date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDate = parseDate(publishedDate);
    const parsedEndDate = parseDate(endDate);
    const currentDate = new Date();
    currentDate.setMilliseconds(0); // Set currentDate to the start of the second

    if (parsedPublishedDate < currentDate) {
        return res.status(400).json({ error: "Published date cannot be in the past." });
    }

    if (parsedEndDate <= parsedPublishedDate) {
        return res.status(400).json({ error: "End date must be after the published date." });
    }

    let sortedAuctions = auctionsData.sort(function (a, b) {
        return (a.id - b.id);
    });
    let highestId = (sortedAuctions.length > 0) ? sortedAuctions[sortedAuctions.length - 1].id : -1;

    auctionsData.push({
        id: highestId + 1,
        cardId: auction.cardId,
        publishedDate: auction.publishedDate,
        endDate: auction.endDate,
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
function isValidDate(dateString) {
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

// Get all auctions or only active ones based on query parameters
router.get("/", async (req, res) => {
    const { active } = req.query;
    const currentDate = new Date();

    let auctions = auctionsData;

    if (active === "true") {
        auctions = auctionsData.filter(auction => {
            const publishedDate = parseDate(auction.publishedDate);
            const endDate = parseDate(auction.endDate);

            return currentDate >= publishedDate && currentDate <= endDate;
        });
    }

    if (auctions.length === 0) {
        return res.json({ error: "No auctions found" });
    }

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
