const Product = require("../models/product");
const User = require("../models/user");
const slugify = require("slugify");

exports.create = async(req, res) => {
    try {
        console.log(req.body);
        req.body.slug = slugify(req.body.title);
        const newProduct = await new Product(req.body).save();
        res.json(newProduct);
    } catch (err) {
        console.log(err);
        // res.status(400).send("Create product failed");
        res.status(400).json({
            err: err.message,
        });
    }
};
exports.find = async(req, res) => {
    try {
        const { email } = req.user;

        // Find the user based on the email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find products based on the seller's _id
        const products = await Product.find({ seller: user._id }).populate('category');

        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: 'Failed to find user products' });
    }
};


exports.listAll = async(req, res) => {
    console.log(req.body)
    const { status } = req.body
    let products = await Product.find({ status })
        .limit(parseInt(req.params.count))
        .populate("category")
        .populate("subs")
        .sort([
            ["createdAt", "desc"]
        ])
        .exec();
    res.json(products);
};

exports.lists = async(req, res) => {


    let products = await Product.find()
        .limit(parseInt(req.params.count))
        .populate("category")
        .populate("seller")
        .populate("subs")
        .sort([
            ["createdAt", "desc"]
        ])
        .exec();
    res.json(products);
};

exports.remove = async(req, res) => {
    try {
        const deleted = await Product.findOneAndRemove({
            slug: req.params.slug,
        }).exec();
        res.json(deleted);
    } catch (err) {
        console.log(err);
        return res.staus(400).send("Product delete failed");
    }
};

exports.read = async(req, res) => {
    const product = await Product.findById(req.params.id)
        .populate("category")
        .populate("subs")
        .populate("seller")

    res.json({ success: true, data: product });
};

exports.update = async(req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updated = await Product.findOneAndUpdate({ _id: req.params.slug },
            req.body, { new: true }
        )
        res.json(updated);
    } catch (err) {
        console.log("PRODUCT UPDATE ERROR ----> ", err);
        // return res.status(400).send("Product update failed");
        res.status(400).json({
            err: err.message,
        });
    }
};

exports.list = async(req, res) => {
    console.table(req.body);
    try {
        // createdAt/updatedAt, desc/asc, 3
        const { sort, order, page, status } = req.body;
        const currentPage = page || 1;
        const perPage = 3; // 3

        const products = await Product.find({ status })
            .skip((currentPage - 1) * perPage)
            .populate("category")
            .populate("subs")
            .sort([
                [sort, order]
            ])
            .limit(perPage)
            .exec();

        res.json(products);
    } catch (err) {
        console.log(err);
    }
};

exports.productsCount = async(req, res) => {
    let total = await Product.find({}).estimatedDocumentCount();
    res.json(total);
};

exports.productStar = async(req, res) => {
    const product = await Product.findById(req.params.productId);
    const user = await User.findOne({ email: req.user.email });
    const { star } = req.body;

    // who is updating?
    // check if currently logged in user have already added rating to this product?
    let existingRatingObject = product.ratings.find(
        (ele) => ele.postedBy.toString() === user._id.toString()
    );

    // if user haven't left rating yet, push it
    if (existingRatingObject === undefined) {
        let ratingAdded = await Product.findByIdAndUpdate(
            product._id, {
                $push: { ratings: { star, postedBy: user._id } },
            }, { new: true }
        );
        console.log("ratingAdded", ratingAdded);
        res.json(ratingAdded);
    } else {
        // if user have already left rating, update it
        const ratingUpdated = await Product.updateOne({
            ratings: { $elemMatch: existingRatingObject },
        }, { $set: { "ratings.$.star": star } }, { new: true }).exec();
        console.log("ratingUpdated", ratingUpdated);
        res.json(ratingUpdated);
    }
};

exports.listRelated = async(req, res) => {
    const product = await Product.findById(req.params.productId);

    const related = await Product.find({
            _id: { $ne: product._id },
            category: product.category,
        })
        .limit(3)
        .populate("category")
        .populate("subs")



    res.json(related);
};

const handleQuery = async(req, res, query) => {
    const products = await Product.find({ $text: { $search: query } })
        .populate("category", "_id name")
        .populate("subs", "_id name")



    res.json(products);
};

const handlePrice = async(req, res, price) => {
    try {
        let products = await Product.find({
                price: {
                    $gte: price[0],
                    $lte: price[1],
                },
            })
            .populate("category", "_id name")
            .populate("subs", "_id name")



        res.json(products);
    } catch (err) {
        console.log(err);
    }
};

const handleCategory = async(req, res, category) => {
    try {
        let products = await Product.find({ category })
            .populate("category", "_id name")
            .populate("subs", "_id name")



        res.json(products);
    } catch (err) {
        console.log(err);
    }
};

const handleStar = async(req, res, stars) => {
    try {
        const aggregates = await Product.aggregate([{
                    $project: {
                        document: "$$ROOT",
                        // title: "$title",
                        floorAverage: {
                            $floor: { $avg: "$ratings.star" }, // floor value of 3.33 will be 3
                        },
                    },
                },
                { $match: { floorAverage: stars } },
            ])
            .limit(12)

        const products = await Product.find({ _id: aggregates }).populate("category", "_id name")
            .populate("subs", "_id name")

        res.json(products);
    } catch (error) {
        console.log(err);
    }

};

const handleSub = async(req, res, sub) => {
    const products = await Product.find({ subs: sub })
        .populate("category", "_id name")
        .populate("subs", "_id name")



    res.json(products);
};

const handleShipping = async(req, res, shipping) => {
    const products = await Product.find({ shipping })
        .populate("category", "_id name")
        .populate("subs", "_id name")

    .exec();

    res.json(products);
};

const handleColor = async(req, res, color) => {
    const products = await Product.find({ color })
        .populate("category", "_id name")
        .populate("subs", "_id name")

    .exec();

    res.json(products);
};

const handleBrand = async(req, res, brand) => {
    const products = await Product.find({ brand })
        .populate("category", "_id name")
        .populate("subs", "_id name")

    .exec();

    res.json(products);
};

exports.searchFilters = async(req, res) => {
    const {
        query,
        price,
        category,
        stars,
        sub,
        shipping,
        color,
        brand,
    } = req.body;

    if (query) {
        console.log("query --->", query);
        await handleQuery(req, res, query);
    }

    // price [20, 200]
    if (price !== undefined) {
        console.log("price ---> ", price);
        await handlePrice(req, res, price);
    }

    if (category) {
        console.log("category ---> ", category);
        await handleCategory(req, res, category);
    }

    if (stars) {
        console.log("stars ---> ", stars);
        await handleStar(req, res, stars);
    }

    if (sub) {
        console.log("sub ---> ", sub);
        await handleSub(req, res, sub);
    }

    if (shipping) {
        console.log("shipping ---> ", shipping);
        await handleShipping(req, res, shipping);
    }

    if (color) {
        console.log("color ---> ", color);
        await handleColor(req, res, color);
    }

    if (brand) {
        console.log("brand ---> ", brand);
        await handleBrand(req, res, brand);
    }
};