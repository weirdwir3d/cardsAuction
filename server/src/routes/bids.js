import express from 'express';
import bids from '../../../db/bidsData.json' assert { type: 'json' };
import auctionsData from '../../../db/auctionsData.json' assert { type: 'json' };
import usersData from '../../../db/usersData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
import * as helper from '../helper.js'
const router = express.Router();

//Edit a bid
router.put('/:id', middleware.isAdmin, (req, res) => {
    const { bidAmount, publishedDateTime, hasWon } = req.body;
    const bidId = parseInt(req.params.id);

    let bidsData = bids;

    //find the bid to update
    let foundBid = bidsData.find(bid => bid.id === bidId);

    if (!foundBid) {
        return res.status(404).json({ error: "Bid not found" });
    }

    let foundAuction = auctionsData.find(auction => auction.id === foundBid.auctionId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found for this bid" });
    }

    //validate new date format, if provided
    if (publishedDateTime && !helper.isValidDateTime(publishedDateTime)) {
        return res.status(400).json({ error: "Invalid date format. Please use 'dd-mm-yyyy hh:mm:ss'" });
    }

    //Parse and validate new publishedDateTime
    if (publishedDateTime) {
        const parsedPublishedDateTime = helper.parseDateTime(publishedDateTime);
        const currentDateTime = new Date();
        currentDateTime.setMilliseconds(0);

        if (parsedPublishedDateTime < currentDateTime) {
            return res.status(400).json({ error: "Published date cannot be in the past" });
        }

        foundBid.publishedDateTime = publishedDateTime;
    }

    //validate the new bid amount
    let allAuctionBids = bidsData.filter(bid => bid.auctionId === foundBid.auctionId && bid.id !== bidId);

    //sort existing bids by publishedDateTime
    let sortedAuctionBids = allAuctionBids.sort((a, b) => helper.parseDateTime(a.publishedDateTime) - helper.parseDateTime(b.publishedDateTime));
    let latestAuctionBid = sortedAuctionBids[sortedAuctionBids.length - 1];

    let minBidAmount = latestAuctionBid ? latestAuctionBid.bidAmount : foundAuction.basePrice;

    if (bidAmount !== undefined && bidAmount <= minBidAmount) {
        return res.status(400).json({ error: "Bid amount must be higher than the previous highest bid or base price" });
    }

    //  Update bid amount if provided
    if (bidAmount !== undefined) {
        foundBid.bidAmount = bidAmount;
    }

    //  Update hasWon if provided and valid
    if (hasWon !== undefined) {
        if (hasWon === true || hasWon === false || hasWon === null) {
            foundBid.hasWon = hasWon;
        } else {
            return res.status(400).json({ error: "hasWon must be true, false, or null" });
        }
    }

    // save updated bid
    res.status(200).json({
        message: "Bid updated successfully!",
        bid: foundBid
    });
});

// POST new bid
router.post('/', middleware.isLoggedIn, (req, res) => {
    const { userId, auctionId, bidAmount, publishedDateTime } = req.body;

    //javascript is so nice for treating '0' differently from the other numbers :)
    if (userId == null || !auctionId || !bidAmount || !publishedDateTime) {
        return res.status(400).json({ error: "Missing one of the required fields" });
    }

    let foundUser = usersData.find(user => user.id === userId);

    if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
    }

    let foundAuction = auctionsData.find(auction => auction.id === auctionId);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    if (!helper.isValidDateTime(publishedDateTime)) {
        return res.status(400).json({ error: "Invalid date format. Please use 'dd-mm-yyyy hh:mm:ss'" });
    }

    const parsedPublishedDateTime = helper.parseDateTime(publishedDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0); // 0 seconds by default

    if (parsedPublishedDateTime < currentDateTime) {
        return res.status(400).json({ error: "Published date cannot be in the past." });
    }

    //bid has to be higher than last bid, or basePrice if this is the first bid
    let allAuctionBids = bids.filter(bid => bid.auctionId === auctionId);
    let minBidAmount;

    if (allAuctionBids.length === 0) {
        minBidAmount = foundAuction.basePrice;
    } else {
        // determine highest bid by sorting by bidAmount in desc order
        let highestBid = allAuctionBids.sort((a, b) => b.bidAmount - a.bidAmount)[0];
        if (highestBid.userId === userId) {
            return res.status(400).json({ error: "You cannot make two consecutive bids" });
        }
        minBidAmount = highestBid.bidAmount;
    }

    if (bidAmount <= minBidAmount) {
        return res.status(400).json({ error: "Bid amount cannot be lower than the previous bid, or the base price of the card" });
    }

    const newBid = {
        id: bids.length > 0 ? bids[bids.length - 1].id + 1 : 1,
        userId: userId,
        auctionId: auctionId,
        bidAmount: bidAmount,
        hasWon: null,
        publishedDateTime: publishedDateTime
    };

    bids.push(newBid);

    res.status(200).json({
        message: "Bid added successfully!",
        bid: newBid
    });
});

// GET one bid
router.get("/:id", async (req, res) => {
    let wantedId = parseInt(req.params.id);

    if (isNaN(wantedId)) {
        return res.status(400).json({ error: "Invalid id format" });
    }

    let foundBid = bids.find(bid => bid.id === wantedId)

    if (!foundBid) {
        return res.status(404).json({ error: "Bid not found" });
    }
    res.status(200).json({ bid: foundBid })
})

//Get all bids, optional for an auction or user
router.get("/", async (req, res) => {
    const { auctionId, userId } = req.query;

    if (auctionId && isNaN(parseInt(auctionId))) {
        return res.status(400).json({ error: "Invalid auctionId" });
    }

    if (userId && isNaN(parseInt(userId))) {
        return res.status(400).json({ error: "Invalid userId" });
    }

    let filteredBids = bids;

    if (auctionId) {
        filteredBids = filteredBids.filter(bid => bid.auctionId === parseInt(auctionId));
    }

    if (userId) {
        filteredBids = filteredBids.filter(bid => bid.userId === parseInt(userId));
    }

    return res.status(200).json({ bids: filteredBids });
});

//DELETE one bid
router.delete('/:id', middleware.isAdmin, (req, res) => {
    const wantedId = parseInt(req.params.id);
    // the auctionId is actually not needed, cause all bids have unique ids
    // but I still wanted to somewhat make bids dependent on auctions
    const auctionId = parseInt(req.query.auctionId);

    if (isNaN(auctionId)) {
        return res.status(400).json({ error: "Missing or invalid auctionId" });
    }

    const foundBidIndex = bids.findIndex(bid => bid.id === wantedId && bid.auctionId === auctionId);

    if (foundBidIndex === -1) {
        return res.status(404).json({ error: "Bid not found for the specified auctionId" });
    }

    const removedBid = bids.splice(foundBidIndex, 1)[0];

    return res.status(200).json({ message: "Bid deleted", bid: removedBid });
});

export default router;
