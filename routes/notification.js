const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const { create, listAll, remove, read, createAdmin } = require("../controllers/notification");

// routes
router.post("/notify", authCheck, create);
router.get("/notify-admin", createAdmin);
router.post("/get-all-notifications", authCheck, listAll);
router.delete("/delete-notification/:id", authCheck, remove);
router.put("/read-all-notifications", authCheck, read);


module.exports = router;