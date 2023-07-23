const express = require("express");
const router = express.Router();
const { createPaymentIntent, khaltiPayment } = require("../controllers/stripe");

// middleware
const { authCheck } = require("../middlewares/auth");

router.post("/create-payment-intent", authCheck, createPaymentIntent);
router.post("/create-khatli", authCheck, khaltiPayment);

module.exports = router;