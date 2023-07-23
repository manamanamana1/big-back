const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const { create, getUser, getUsers } = require("../controllers/conversation.js");

// routes
router.post("/conversation", authCheck, create);
router.get("/conversation/:userId", authCheck, getUser);
router.get("/conversation/find/:firstUserId/:secondUserId", authCheck, getUsers);


module.exports = router;