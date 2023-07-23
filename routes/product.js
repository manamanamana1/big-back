const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controller
const {
    create,
    listAll,
    remove,
    read,
    update,
    list,
    productsCount,
    productStar,
    listRelated,
    searchFilters,
    lists,
    find
} = require("../controllers/product");

// routes
router.post("/product", authCheck, create);
router.get("/product/find", authCheck, find);
router.get("/products/total", productsCount);
router.post("/products/:count", listAll); // products/100
router.get("/lists/:count", lists);
router.delete("/product/:slug", authCheck, remove);
router.get("/product/:id", read);
router.put("/product/:slug", authCheck, update);
router.put("/product/star/:productId", authCheck, productStar);
router.get("/product/related/:productId", listRelated);
router.post("/search/filters", searchFilters);
router.post("/products", list);
module.exports = router;