const mongoose = require("mongoose");



// PRODUCT VARIANT IDEA
// refer to a new model with array type that contains object (different size will have different price)
// https://stackoverflow.com/questions/46870088/how-to-add-different-sizes-of-a-product-in-mongoose-model

/**
 const ProductVariant = new mongoose.Schema({
  name: String,  // If you're certain this will only ever be sizes, you could make it an enum
  inventory: Number
});
module.exports = mongoose.model('Product',{
  imagePath: {type: String, required: true},
  title: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number, required: true},
  variants: [ProductVariant]
});
 */

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        text: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000,

        text: true,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        maxlength: 32,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    subs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sub",
    }, ],
    quantity: Number,
    sold: {
        type: Number,
        default: 0,
    },
    images: {
        type: Array,
    },
    shipping: {
        type: String,
        enum: ["Yes", "No"],
    },
    brandNew: {
        type: String,
        enum: ["Yes", "No"],
    },
    age: {
        type: Number,
        default: 1,
    },
    color: {
        type: String,


    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    ratings: [{
        star: Number,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }, ],

    status: {
        type: String,
        default: "pending",
        required: true,
    },
}, { timestamps: true });


module.exports = mongoose.model("Product", productSchema);