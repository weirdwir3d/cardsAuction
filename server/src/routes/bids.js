import express from 'express';
import bidsData from '../../../db/bidsData.json' assert { type: 'json' };
import auctionsData from '../../../db/auctionsData.json' assert { type: 'json' };
import usersData from '../../../db/usersData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
const router = express.Router();

// Edit a bid
router.put('/:id', middleware.isAdmin, (req, res) => {
    const { bidAmount, publishedDateTime } = req.body;
    const bidId = parseInt(req.params.id);

    // Find the bid to update
    let foundBid = bidsData.find(bid => bid.id === bidId);

    if (!foundBid) {
        return res.status(404).json({ error: "Bid not found" });
    }

    let foundAuction = auctionsData.find(auction => auction.id === foundBid.auctionId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found for this bid" });
    }

    // Validate the new date format, if provided
    if (publishedDateTime && !isValidDateTime(publishedDateTime)) {
        return res.status(400).json({ error: "Invalid date format. Please use 'dd-mm-yyyy hh:mm:ss'." });
    }

    // Parse and validate new publishedDateTime
    if (publishedDateTime) {
        const parsedPublishedDateTime = parseDate(publishedDateTime);
        const currentDateTime = new Date();
        currentDateTime.setMilliseconds(0); // Remove milliseconds for comparison

        if (parsedPublishedDateTime < currentDateTime) {
            return res.status(400).json({ error: "Published date cannot be in the past." });
        }

        foundBid.publishedDateTime = publishedDateTime; // Update date
    }

    // Validate the new bid amount
    let allAuctionBids = bidsData.filter(bid => bid.auctionId === foundBid.auctionId && bid.id !== bidId);

    // Sort existing bids by publishedDateTime
    let sortedAuctionBids = allAuctionBids.sort((a, b) => parseDate(a.publishedDateTime) - parseDate(b.publishedDateTime));
    let latestAuctionBid = sortedAuctionBids[sortedAuctionBids.length - 1];

    let minBidAmount = latestAuctionBid ? latestAuctionBid.bidAmount : foundAuction.basePrice;

    if (bidAmount !== undefined && bidAmount <= minBidAmount) {
        return res.status(400).json({ error: "Bid amount must be higher than the previous highest bid or base price." });
    }

    // Update bid amount if provided
    if (bidAmount !== undefined) {
        foundBid.bidAmount = bidAmount;
    }

    // Save the updated bid
    res.status(200).json({
        message: "Bid updated successfully!",
        bid: foundBid
    });
});

// Create a new bid
router.post('/', middleware.isLoggedIn, (req, res) => {
    console.log('in fucking method')
    const { userId, auctionId, bidAmount, publishedDateTime } = req.body;
    console.log('userId:', userId);
    console.log('auctionId:', auctionId);
    console.log('bidAmount:', bidAmount);
    console.log('publishedDateTime:', publishedDateTime);
    if (userId == null || auctionId == null || bidAmount == null || !publishedDateTime) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    console.log("Received bid request:", req.body);

    let foundUser = usersData.find(user => user.id == userId);
    console.log("Found user:", foundUser);

    if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
    }
    
    let foundAuction = auctionsData.find(auction => auction.id == auctionId);
    console.log("Found auction:", foundAuction);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    if (!isValidDateTime(publishedDateTime)) {
        return res.status(400).json({ error: "Invalid date format. Please use 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDateTime = parseDate(publishedDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0); // Set currentDate to the start of the second

    if (parsedPublishedDateTime < currentDateTime) {
        return res.status(400).json({ error: "Published date cannot be in the past." });
    }

    //bid has to be higher than last bid, or basePrice if this is the first bid
    let sortedBids = bidsData.sort(function (a, b) {
        return (a.id - b.id);
    });
    let highestId = (sortedBids.length > 0) ? sortedBids[sortedBids.length - 1].id : -1;
    let allAuctionBids = bidsData.filter(bid => bid.auctionId === auctionId);

    let minBidAmount;

    if (!allAuctionBids) {
        minBidAmount = foundAuction.basePrice;
    } else {
        let sortedAuctionBids = allAuctionBids.sort((a, b) => parseDate(a.publishedDateTime) - parseDate(b.publishedDateTime));
        let latestAuctionBid = sortedAuctionBids[sortedAuctionBids.length - 1];

        if (latestAuctionBid.userId === userId) {
            return res.status(400).json({ error: "You cannot make two consecutive bids." });
        }
        minBidAmount = latestAuctionBid.bidAmount;
    }

    if (bidAmount <= minBidAmount) {
        return res.status(400).json({ error: "Bid amount cannot be lower than the previous bid, or the base price of the card." });
    }

    const newBid = {
        id: bidsData.length > 0 ? bidsData[bidsData.length - 1].id + 1 : 1,
        userId: userId,
        auctionId: auctionId,
        bidAmount: bidAmount,
        hasWon: null,
        publishedDateTime: publishedDateTime
    };

    bidsData.push(newBid);
    // console.log("New bid added:", newBid);

    res.status(200).json({
        message: "Bid added successfully!",
        bid: newBid
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

// GET one bid
router.get("/:id", async (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundBid = bidsData.find(bid => bid.id === wantedId)
    console.log('found id:', wantedId, 'foud bid:', foundBid)
    res.json({ foundBid })
})

// Get all bids, with optional filters for auctionId or userId
router.get("/", async (req, res) => {
    const { auctionId, userId } = req.query;

    // If no auctionId or userId is provided, return a 400 Bad Request
    if (!auctionId && !userId) {
        return res.status(400).json({ error: "Missing required auctionId or userId parameter." });
    }

    let filteredBids = bidsData;

    // If auctionId is provided, filter bids by auctionId
    if (auctionId) {
        filteredBids = filteredBids.filter(bid => bid.auctionId === parseInt(auctionId));
    }

    // If userId is provided, filter bids by userId
    if (userId) {
        filteredBids = filteredBids.filter(bid => bid.userId === parseInt(userId));
    }

    // If no bids are found, return 404 Not Found
    if (filteredBids.length === 0) {
        return res.status(404).json({ error: "No bids found for the given filters." });
    }

    // Otherwise, return the filtered bids with 200 OK
    return res.status(200).json({ bids: filteredBids });
});



// Delete a bid
router.delete('/:id', middleware.isAdmin, (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundBid = bidsData.find(bid => bid.id === wantedId);

    if (!foundBid) {
        return res.status(404).json({ error: "Bid not found" });
    }

    let removedBid;
    const index = bidsData.indexOf(foundBid);
    if (index > -1) {
        removedBid = bidsData.splice(index, 1);
    }

    if (!removedBid) {
        return res.status(404).json({ error: "Bid not found" });
    }

    return res.status(202).json({ error: "Bid deleted: " + JSON.stringify(removedBid) });
});

export default router;
