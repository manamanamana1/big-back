const express = require("express");

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");
// controllers
const {
    userCart,
    getUserCart,
    emptyCart,
    saveAddress,
    applyCouponToUserCart,
    createOrder,
    orders,
    addToWishlist,
    wishlist,
    removeFromWishlist,
    createCashOrder,
    updateStatus,
    changeCoupon,
    getUsers,
    getUser,
    uploadImage,
    findUsers,
    findone
} = require("../controllers/user");

router.post("/user/cart", authCheck, userCart); // save cart
router.get("/user/cart", authCheck, getUserCart);
router.get("/users", authCheck, getUsers);
router.post("/users/find", authCheck, findUsers);
router.post("/user/find", authCheck, findone);
router.get("/user", authCheck, getUser)
router.put("/user/profile", authCheck, uploadImage)
router.delete("/user/cart", authCheck, emptyCart);
router.post("/user/address", authCheck, saveAddress);

router.post("/user/cart/coupon", authCheck, applyCouponToUserCart);
router.post("/sendcoupon", authCheck, adminCheck, changeCoupon);

router.post("/user/order", authCheck, createOrder);
router.post("/user/cash-order", authCheck, createCashOrder); // cod
router.get("/user/orders", authCheck, orders);
router.put("/user/update-status/:id", authCheck, adminCheck, updateStatus);

router.post("/user/wishlist", authCheck, addToWishlist);
router.get("/user/wishlist", authCheck, wishlist);
router.put("/user/wishlist", authCheck, removeFromWishlist);


module.exports = router;