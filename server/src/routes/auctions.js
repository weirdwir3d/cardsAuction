import express from 'express';
import auctionsData from '../../../db/auctionsData.json' assert { type: 'json' };
import cardsData from '../../../db/cardsData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
const router = express.Router();

// Edit an auction
router.put('/:id', middleware.isAdmin, (req, res) => {
    const auctionId = parseInt(req.params.id);
    const auctionToUpdate = req.body;

    console.log('backend new auction details:', auctionToUpdate)

    let foundAuction = auctionsData.find(auction => auction.id === auctionId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    // Validation for base price
    if (auctionToUpdate.basePrice != foundAuction.basePrice) {
        if (auctionToUpdate.basePrice <= 0) {
            return res.status(403).json({ error: "Base price cannot be zero or less" });
        }
        foundAuction.basePrice = auctionToUpdate.basePrice;
    }

    if (!isValidDateTime(auctionToUpdate.publishedDateTime)) {
        console.log('wrong startdate')
        return res.status(400).json({ error: "Invalid published date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    if (auctionToUpdate.endDateTime && !isValidDateTime(auctionToUpdate.endDateTime)) {
        console.log('wrong enddate')
        return res.status(400).json({ error: "Invalid end date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDateTime = parseDate(auctionToUpdate.publishedDateTime);
    const parsedEndDateTime = parseDate(auctionToUpdate.endDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0); // Set currentDate to the start of the second

    if (auctionToUpdate.publishedDateTime != foundAuction.publishedDateTime) {
        if (parsedPublishedDateTime < currentDateTime) {
            console.log('Published date cannot be in the past.')
            return res.status(400).json({ error: "Published date cannot be in the past." });
        }
        foundAuction.publishedDateTime = auctionToUpdate.publishedDateTime;
    }

    if (auctionToUpdate.endDateTime != foundAuction.endDateTime) {
        if (parsedEndDateTime <= parsedPublishedDateTime) {
            console.log('End date must be after the published date.')
            return res.status(400).json({ error: "End date must be after the published date." });
        }
        foundAuction.endDateTime = auctionToUpdate.endDateTime;
    }


    // Respond with a success message
    res.status(200).json({
        message: "Auction updated successfully!",
        auctionToUpdate: foundAuction
    });
});

// GET one auction by ID
router.get("/:id", async (req, res) => {
    try {
        const auctionId = parseInt(req.params.id);

        if (isNaN(auctionId)) {
            return res.status(400).json({ error: "Invalid auction ID format" });
        }

        const auction = auctionsData.find(auction => auction.id === auctionId);

        if (!auction) {
            return res.status(404).json({ error: "Auction not found" });
        }

        console.log('Requested auction ID:', auctionId, 'Auction details:', auction);

        res.status(200).json(auction); // Respond with auction details
    } catch (error) {
        console.error('Error retrieving auction:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create a new auction
router.post('/', middleware.isAdmin, (req, res) => {
    const auction = req.body;

    console.log('Received auction data:', auction);

    if (!auction.cardId) {
        return res.status(400).json({ error: "No card selected" });
    }

    let cardId = parseInt(auction.cardId);
    console.log('Parsed cardId:', cardId);

    let foundAuction = auctionsData.find(existingAuction => existingAuction.cardId === cardId);
    if (foundAuction) {
        console.log('Found existing auction for cardId:', cardId);
        return res.status(400).json({ error: "There is already an auction active for that card" });
    }

    const basePrice = auction.basePrice;
    const publishedDateTime = auction.publishedDateTime;
    const endDateTime = auction.endDateTime;

    console.log('Base Price:', basePrice);
    console.log('Published DateTime:', publishedDateTime);
    console.log('End DateTime:', endDateTime);

    if (basePrice <= 0) {
        console.error('Base price validation failed:', basePrice);
        return res.status(403).json({ error: "Base price cannot be zero or less" });
    }

    if (!isValidDateTime(publishedDateTime)) {
        console.error('Invalid published date format:', publishedDateTime);
        return res.status(400).json({ error: "Invalid published date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    if (!isValidDateTime(endDateTime)) {
        console.error('Invalid end date format:', endDateTime);
        return res.status(400).json({ error: "Invalid end date format. It must be 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDateTime = parseDate(publishedDateTime);
    const parsedEndDateTime = parseDate(endDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0); // Set currentDate to the start of the second

    console.log('Parsed Published DateTime:', parsedPublishedDateTime);
    console.log('Parsed End DateTime:', parsedEndDateTime);
    console.log('Current DateTime:', currentDateTime);

    if (parsedPublishedDateTime < currentDateTime) {
        console.error('Published date is in the past:', parsedPublishedDateTime);
        return res.status(400).json({ error: "Published date cannot be in the past." });
    }

    if (parsedEndDateTime <= parsedPublishedDateTime) {
        console.error('End date is not after the published date:', parsedEndDateTime, parsedPublishedDateTime);
        return res.status(400).json({ error: "You cannot post an auction in the past" });
    }

    let sortedAuctions = auctionsData.sort(function (a, b) {
        return (a.id - b.id);
    });
    let highestId = (sortedAuctions.length > 0) ? sortedAuctions[sortedAuctions.length - 1].id : -1;

    console.log('Highest Auction ID:', highestId);

    const newAuction = {
        id: highestId + 1,
        cardId: auction.cardId,
        publishedDateTime: auction.publishedDateTime,
        endDateTime: auction.endDateTime,
        basePrice: auction.basePrice
    };

    auctionsData.push(newAuction);

    console.log('Auction added successfully:', newAuction);

    // Now update the card with the auctionId
    let foundCard = cardsData.find(card => card.id === cardId);
    if (foundCard) {
        foundCard.auctionId = newAuction.id;
        console.log('Card updated with auctionId:', foundCard);
    } else {
        console.error('Card not found for cardId:', cardId);
        return res.status(404).json({ error: "Card not found" });
    }

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
        // console.log('retrieving active auctions...')
        auctions = auctions.filter(auction => {
            const publishedDate = parseDate(auction.publishedDateTime);
            const endDate = parseDate(auction.endDateTime);
            return currentDate >= publishedDate && currentDate <= endDate;
        });
    }

    // Search auctions by card name
    if (search) {
        // console.log('filtering auctions by card name...')
        const searchLower = search.toLowerCase();
        const filteredCards = cardsData.filter(card => card.name.toLowerCase().includes(searchLower));
        const filteredCardIds = filteredCards.map(card => card.id);
        auctions = auctions.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // Filter auctions by card type
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

    // Filter auctions by card rarity
    if (rarity) {
        // console.log('filtering auctions by rarity')
        // console.log('cards raritis:', cardsData.map(card => card.rarity))
        const filteredCards = cardsData.filter(card => card.rarity === rarity);
        const filteredCardIds = filteredCards.map(card => card.id);
        auctions = auctions.filter(auction => filteredCardIds.includes(auction.cardId));
    }

    // Filter by price range (gte and lte)
    if (price) {
        console.log('filtering auctions by price')
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
    const auctionId = parseInt(req.params.id);
    let foundAuction = auctionsData.find(auction => auction.id === auctionId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    // Remove the auction from the auctionsData
    const index = auctionsData.indexOf(foundAuction);
    if (index > -1) {
        auctionsData.splice(index, 1);
    }

    // Find the card linked to this auction and set its auctionId to -1
    const foundCard = cardsData.find(card => card.auctionId === auctionId);
    if (foundCard) {
        foundCard.auctionId = -1;
        console.log(`Card ID ${foundCard.id} auctionId set to -1`);
    } else {
        console.log(`No card found linked to auction ID ${auctionId}`);
    }

    // Respond with a success message
    return res.status(202).json({
        message: `Auction with ID ${auctionId} deleted successfully`,
        removedAuction: foundAuction,
        updatedCard: foundCard || null
    });
});

export default router;
