const Coupon = require("../models/coupon");

// create, remove, list

exports.create = async(req, res) => {
    try {
        // console.log(req.body);
        // return;
        const { hex, expiry, discount } = req.body.coupon;
        res.json(await new Coupon({ name: hex, expiry, discount }).save());
    } catch (err) {
        console.log(err);
    }
};

exports.remove = async(req, res) => {
    try {
        res.json(await Coupon.findByIdAndDelete(req.params.couponId));
    } catch (err) {
        console.log(err);
    }
};

exports.list = async(req, res) => {
    try {
        res.json(await Coupon.find({}).sort({ createdAt: -1 }));
    } catch (err) {
        console.log(err);
    }
};