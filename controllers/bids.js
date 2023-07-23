const Bid = require("../models/bidModel");
const Product = require("../models/product");

exports.create = async(req, res) => {
    try {
        const { product, seller, buyer, bidAmount, message, mobile } = req.body;

        // Check if the buyer has already placed a bid on the product
        const existingBid = await Bid.findOne({ product, buyer });

        if (existingBid) {
            // If the buyer has already placed a bid, update the bid amount
            existingBid.bidAmount = bidAmount;
            existingBid.message = message;
            existingBid.mobile = mobile;
            await existingBid.save();
            res.json(existingBid);
        } else {
            // If the buyer has not placed a bid, create a new bid
            const newBid = new Bid({ product, seller, buyer, bidAmount, message, mobile });
            await newBid.save();
            res.json(newBid);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.get = async(req, res) => {
    const { product } = req.body; // Retrieve the product ID from the request body
    console.log(req.body)
    try {
        const bids = await Bid.find({ product })
            .populate("product")
            .populate("buyer")
            .populate("seller")
            .sort({ createdAt: -1 })
            .exec();

        res.json({ success: true, data: bids });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error" });
    }
};