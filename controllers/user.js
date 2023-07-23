const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const uniqueid = require("uniqueid");


exports.getUsers = async(req, res) => {
    try {
        const loggedInUserEmail = req.user.email; // Get the email of the logged-in user
        const users = await User.find({
            email: { $ne: loggedInUserEmail },

        }); // Find all users except the logged-in user and users with the "admin" role
        res.json(users);
    } catch (error) {
        console.log(error);
    }
};

exports.findUsers = async(req, res) => {
    try {
        const { searchQuery } = req.body;

        // Perform the search query using the provided searchQuery
        const users = await User.find({ name: { $regex: searchQuery, $options: "i" } });

        res.json(users);
    } catch (error) {
        console.error("Error finding users:", error);
        res.status(500).json({ error: "An error occurred while finding users" });
    }
}

exports.findone = async(req, res) => {
    try {
        const { _id } = req.body;

        // Perform the search query using the provided searchQuery
        const users = await User.find({ _id });

        res.json(users);
    } catch (error) {
        console.error("Error finding users:", error);
        res.status(500).json({ error: "An error occurred while finding users" });
    }
}

exports.getUser = async(req, res) => {
    try {
        const { email } = req.user
        const user = await User.find({ email })

        res.status(200).json(user)
    } catch (error) {
        console.log(error)
    }
};

exports.uploadImage = async(req, res) => {
    try {
        const loggedInUserEmail = req.user.email;
        const { images } = req.body
            // Find the user by email
        const user = await User.findOne({ email: loggedInUserEmail });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the user's image
        user.images = images; // Assuming you're using a file upload middleware and the file path is available in req.file.path

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: "Image uploaded successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.userCart = async(req, res) => {
    // console.log(req.body); // {cart: []}
    const { cart } = req.body;

    let products = [];

    const user = await User.findOne({ email: req.user.email });

    // check if cart with logged in user id already exist
    let cartExistByThisUser = await Cart.findOne({ orderdBy: user._id });

    if (cartExistByThisUser) {
        await Cart.deleteOne(cartExistByThisUser)
        console.log("removed old cart");
    }

    for (let i = 0; i < cart.length; i++) {
        let object = {};

        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        // get price for creating total
        let productFromDb = await Product.findById(cart[i]._id)
            .select("price")

        object.price = productFromDb.price;

        products.push(object);
    }

    // console.log('products', products)

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
    }

    // console.log("cartTotal", cartTotal);

    let newCart = await new Cart({
        products,
        cartTotal,
        orderdBy: user._id,
    }).save();

    console.log("new cart ----> ", newCart);
    res.json({ ok: true });
};

exports.getUserCart = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });

        let cart = await Cart.findOne({ orderdBy: user._id })
            .populate("products.product", "_id title price totalAfterDiscount")
            .exec();

        const { products, cartTotal, totalAfterDiscount } = cart;

        res.json({ products, cartTotal, totalAfterDiscount });
    } catch (error) {
        console.log(error);
    }
};

exports.emptyCart = async(req, res) => {
    console.log("empty cart");
    const user = await User.findOne({ email: req.user.email }).exec();

    const cart = await Cart.findOneAndRemove({ orderdBy: user._id }).exec();
    res.json(cart);
};

exports.saveAddress = async(req, res) => {
    const userAddress = await User.findOneAndUpdate({ email: req.user.email }, { address: req.body.address });

    res.json({ ok: true });
};

//demo for appling onetime use coupon
exports.changeCoupon = async(req, res) => {
    const { email, coupon } = req.body;

    const validCoupon = await Coupon.findOne({ name: coupon }).exec();
    if (validCoupon === null) {
        return res.status(400).json({ message: "Coupon is not valid" });
    }

    // Check if the coupon already exists for the user
    const existingCoupon = await User.findOne({ email, "coupons.coupon": coupon });

    if (existingCoupon) {
        // Coupon already exists, do not save again
        res.status(400).json({ message: "Coupon already exists for the user" });
    } else {
        // Add the coupon to the user's document
        const user = await User.findOneAndUpdate({ email }, {
            $push: {
                coupons: {
                    coupon,
                    couponApplied: false,
                },
            },
        }, { upsert: true, new: true });

        res.json(user);
    }
};
exports.applyCouponToUserCart = async(req, res) => {
    const { coupon } = req.body;
    console.log("COUPON", coupon);

    const validCoupon = await Coupon.findOne({ name: coupon }).exec();
    if (validCoupon === null) {
        return res.json({
            err: "Invalid coupon",
        });
    }


    const user = await User.findOne({ email: req.user.email }).exec();
    if (validCoupon && user) {
        const appliedCoupons = user.coupons;
        const appliedCoupon = appliedCoupons.find((c) => c.coupon === coupon);
        if (appliedCoupon && appliedCoupon.couponApplied === false) {
            await User.updateOne({ email: req.user.email, "coupons.coupon": coupon }, { $set: { "coupons.$.couponApplied": true } }).exec();

            await User.updateOne({ email: req.user.email }, { $pull: { coupons: { coupon: coupon } } }).exec();

            let { products, cartTotal } = await Cart.findOne({ orderdBy: user._id })
                .populate("products.product", "_id title price")
                .exec();

            console.log("cartTotal", cartTotal, "discount%", validCoupon.discount);

            // calculate the total after discount
            let totalAfterDiscount = (
                cartTotal - (cartTotal * validCoupon.discount) / 100
            ).toFixed(2); // 99.99

            console.log("----------> ", totalAfterDiscount);

            await Cart.findOneAndUpdate({ orderdBy: user._id }, { totalAfterDiscount }, { new: true }).exec();

            // Delete the specific coupon from the user's coupons array


            return res.json(totalAfterDiscount);
        } else {

            if (validCoupon) {
                return res.json({ message: "Coupon has already been applied" });
            } else {
                return res.json({ message: "invalid coupon" });
            }
        }
    } else {
        return res.json({ message: "User not found" });
    }
};
exports.createOrder = async(req, res) => {
    // console.log(req.body);
    // return;
    const { paymentIntent } = req.body.stripeResponse;

    const user = await User.findOne({ email: req.user.email }).exec();

    let { products } = await Cart.findOne({ orderdBy: user._id }).exec();

    let newOrder = await new Order({
        products,
        paymentIntent,
        orderdBy: user._id,
    }).save();

    let bulkOption = products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id }, // IMPORTANT item.product
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        };
    });

    let updated = await Product.bulkWrite(bulkOption, {});
    console.log("PRODUCT QUANTITY-- AND SOLD++", updated);

    console.log("NEW ORDER SAVED", newOrder);
    res.json({ ok: true });
};

exports.orders = async(req, res) => {
    let user = await User.findOne({ email: req.user.email }).exec();

    let userOrders = await Order.find({ orderdBy: user._id })
        .sort({ createdAt: -1 })
        .populate("products.product")
        .exec();

    res.json(userOrders);
};

exports.addToWishlist = async(req, res) => {
    const { productId } = req.body;

    const user = await User.findOneAndUpdate({ email: req.user.email }, { $addToSet: { wishlist: productId } }).exec();

    res.json({ ok: true });
};

exports.wishlist = async(req, res) => {
    const list = await User.findOne({ email: req.user.email })
        .select("wishlist")
        .populate("wishlist")
        .exec();

    res.json(list);
};

exports.removeFromWishlist = async(req, res) => {
    const { productId } = req.body;
    const user = await User.findOneAndUpdate({ email: req.user.email }, { $pull: { wishlist: productId } }).exec();

    res.json({ ok: true });
};

exports.createCashOrder = async(req, res) => {
    const { COD, couponApplied } = req.body;
    // if COD is true, create order with status of Cash On Delivery

    if (!COD) return res.status(400).send("Create cash order failed");

    const user = await User.findOne({ email: req.user.email }).exec();

    let userCart = await Cart.findOne({ orderdBy: user._id }).exec();

    let finalAmount = 0;

    if (couponApplied && userCart.totalAfterDiscount) {
        finalAmount = userCart.totalAfterDiscount * 100;
    } else {
        finalAmount = userCart.cartTotal * 100;
    }

    let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
            id: uniqueid(),
            amount: finalAmount,
            currency: "usd",
            status: "Cash On Delivery",
            created: Date.now(),
            payment_method_types: ["cash"],
        },
        orderdBy: user._id,
        orderStatus: "Cash On Delivery",
    }).save();

    // decrement quantity, increment sold
    let bulkOption = userCart.products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id }, // IMPORTANT item.product
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        };
    });

    let updated = await Product.bulkWrite(bulkOption, {});
    console.log("PRODUCT QUANTITY-- AND SOLD++", updated);

    console.log("NEW ORDER SAVED", newOrder);
    res.json({ ok: true });
};

exports.updateStatus = async(req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send({
            success: true,
            message: "User status updated successfully",
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
};