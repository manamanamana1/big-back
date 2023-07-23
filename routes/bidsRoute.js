const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const { create, get } = require("../controllers/bids");
router.post("/place-new-bid", authCheck, create);
router.post("/get-all-bids", get);


module.exports = router;