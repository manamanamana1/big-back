const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

const { create, get } = require("../controllers/message");

router.post("/message", authCheck, create);
router.get("/message/:conversationId", authCheck, get);


module.exports = router;