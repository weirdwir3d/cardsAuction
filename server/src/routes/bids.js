import express from 'express';
import bidsData from '../../../db/bidsData.json' assert { type: 'json' };
import auctionsData from '../../../db/auctionsData.json' assert { type: 'json' };
import usersData from '../../../db/usersData.json' assert { type: 'json' };
import * as middleware from '../middleware/middleware.js';
import * as utils from '../utils.js'
const router = express.Router();

//Edit a bid
router.put('/:id', middleware.isAdmin, (req, res) => {
    const { bidAmount, publishedDateTime, hasWon } = req.body;
    const bidId = parseInt(req.params.id);

    // console.log(`received request to edit bid with id: ${bidId}`);

    //find the bid to update
    let foundBid = bidsData.find(bid => bid.id === bidId);

    if (!foundBid) {
        console.error(`Bid with ID ${bidId} not found.`);
        return res.status(404).json({ error: "Bid not found" });
    }

    // console.log(`found bid:`, foundBid);

    let foundAuction = auctionsData.find(auction => auction.id === foundBid.auctionId);

    if (!foundAuction) {
        console.error(`Auction not found for bid with ID ${bidId}`);
        return res.status(404).json({ error: "Auction not found for this bid" });
    }

    // console.log(`Foud auction for bid:`, foundAuction);

    //validate new date format, if provided
    if (publishedDateTime && !utils.isValidDateTime(publishedDateTime)) {
        console.error(`Invalid date format: ${publishedDateTime}`);
        return res.status(400).json({ error: "Invalid date format. Please use 'dd-mm-yyyy hh:mm:ss'" });
    }

    //Parse and validate new publishedDateTime
    if (publishedDateTime) {
        const parsedPublishedDateTime = utils.parseDateTime(publishedDateTime);
        const currentDateTime = new Date();
        currentDateTime.setMilliseconds(0);

        // console.log(`parsed publihed date: ${parsedPublishedDateTime}, current date: ${currentDateTime}`);

        if (parsedPublishedDateTime < currentDateTime) {
            console.error(`Published date ${publishedDateTime} is in the past.`);
            return res.status(400).json({ error: "Published date cannot be in the past." });
        }

        foundBid.publishedDateTime = publishedDateTime;
        // console.log(`updated publishedDateTime tooo: ${foundBid.publishedDateTime}`);
    }

    //validate the new bid amount
    let allAuctionBids = bidsData.filter(bid => bid.auctionId === foundBid.auctionId && bid.id !== bidId);

    // console.log(`Filtered auction bids:`, allAuctionBids);

    //sort existing bids by publishedDateTime
    let sortedAuctionBids = allAuctionBids.sort((a, b) => utils.parseDateTime(a.publishedDateTime) - utils.parseDateTime(b.publishedDateTime));
    let latestAuctionBid = sortedAuctionBids[sortedAuctionBids.length - 1];

    // console.log(`sorted auction bids:`, sortedAuctionBids);
    // console.log(`latest auction bid:`, latestAuctionBid);

    let minBidAmount = latestAuctionBid ? latestAuctionBid.bidAmount : foundAuction.basePrice;

    // console.log(`minimum allowed bid amount: ${minBidAmount}`);

    if (bidAmount !== undefined && bidAmount <= minBidAmount) {
        console.error(`Bid amount ${bidAmount} is less than or equal to the minimum bid amount.`);
        return res.status(400).json({ error: "Bid amount must be higher than the previous highest bid or base price." });
    }

    //  Update bid amount if provided
    if (bidAmount !== undefined) {
        foundBid.bidAmount = bidAmount;
        // console.log(`updated bid amount to: ${foundBid.bidAmount}`);
    }

    //  Update hasWon if provided
    if (typeof hasWon === 'boolean') {
        foundBid.hasWon = hasWon;
        // console.log(`updated hasWon to: ${foundBid.hasWon}`);
    } else {
        console.error(`Invalid hasWon value: ${hasWon}`);
        return res.status(400).json({ error: "hasWon must be true or false." });
    }

    // console.log(`hasWon value is: ${hasWon}`);

    // save updated bid
    res.status(200).json({
        message: "Bid updated successfully!",
        bid: foundBid
    });

    // console.log(`bid updated successfully:`, foundBid);
});


// POST new bid
router.post('/', middleware.isLoggedIn, (req, res) => {
    // console.log('in fucking method')
    const { userId, auctionId, bidAmount, publishedDateTime } = req.body;
    // console.log('userId:', userId);
    // console.log('auctionId:', auctionId);
    // console.log('bidAmount:', bidAmount);
    // console.log('publishedDateTime:', publishedDateTime);
    if (userId == null || auctionId == null || bidAmount == null || !publishedDateTime) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // console.log("received bid request:", req.body);

    let foundUser = usersData.find(user => user.id == userId);
    // console.log("found user:", foundUser);

    if (!foundUser) {
        return res.status(404).json({ error: "User not found" });
    }
    
    let foundAuction = auctionsData.find(auction => auction.id == auctionId);
    // console.log("found auction:", foundAuction);

    if (!foundAuction) {
        return res.status(404).json({ error: "Auction not found" });
    }

    if (!utils.isValidDateTime(publishedDateTime)) {
        return res.status(400).json({ error: "Invalid date format. Please use 'dd-mm-yyyy hh:mm:ss'." });
    }

    const parsedPublishedDateTime = utils.parseDateTime(publishedDateTime);
    const currentDateTime = new Date();
    currentDateTime.setMilliseconds(0); // 0 seconds by default

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
        let sortedAuctionBids = allAuctionBids.sort((a, b) => utils.parseDateTime(a.publishedDateTime) - utils.parseDateTime(b.publishedDateTime));
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

// GET one bid
router.get("/:id", async (req, res) => {
    let wantedId = parseInt(req.params.id);
    let foundBid = bidsData.find(bid => bid.id === wantedId)
    // console.log('found id:', wantedId, 'foud bid:', foundBid)
    res.json({ foundBid })
})

//Get all bids for an auction or user
router.get("/", async (req, res) => {
    const { auctionId, userId } = req.query;

    if (!auctionId && !userId) {
        return res.status(400).json({ error: "Missing required auctionId or userId parameter." });
    }

    let filteredBids = bidsData;

    if (auctionId) {
        filteredBids = filteredBids.filter(bid => bid.auctionId === parseInt(auctionId));
    }

    if (userId) {
        filteredBids = filteredBids.filter(bid => bid.userId === parseInt(userId));
    }

    if (filteredBids.length === 0) {
        return res.status(404).json({ error: "No bids found for the given filters." });
    }

    return res.status(200).json({ bids: filteredBids });
});



//DELETE one bid
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
