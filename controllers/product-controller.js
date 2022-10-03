const User = require("../models/User");
const CreateCollection = require("../models/CreateCollection");
const FixedPriceMarket = require("../models/FixedPriceMarket");
exports.createCollection = (req, res) => {
    const { name, url, description, category, payment, user_id } = req.body;
    const logoImage = req.files["logoImage"][0].filename;
    const bannerImage = req.files["bannerImage"][0].filename;
    User.findOne({ user_id: user_id }).then((user) => {
        if (!user) {
            return res.status(400).json({ resp: "This user not found" });
        }
        newCollection = new CreateCollection();
        newCollection.user_id = user_id;
        newCollection.collection_name = name;
        newCollection.collection_logoImage = logoImage;
        newCollection.collection_bannerImage = bannerImage;
        newCollection.collection_url = url;
        newCollection.collection_description = description;
        newCollection.collection_category = category;
        newCollection.collection_payment = payment;
        newCollection
            .save()
            .then(res.status(200).json({ resp: "success" }))
            .catch((err) => console.log(err));
    });
};

exports.FixedPriceMarket = (req, res) => {
    const { price, title, description, royalties, size, abstract, user_id } =
        req.body;
    const assets = req.files["assets"][0].filename;
    User.findOne({ user_id: user_id }).then((user) => {
        if (!user) {
            return res.status(400).json({ resp: "This user not found" });
        }
        newItem = new FixedPriceMarket();
        newItem.user_id = user_id;
        newItem.item_price = price;
        newItem.item_title = title;
        newItem.item_royalties = royalties;
        newItem.item_size = size;
        newItem.item_description = description;
        newItem.item_abstract = abstract;
        newItem.item_assets = assets;
        newItem
            .save()
            .then(res.status(200).json({ resp: "success" }))
            .catch((err) => console.log(err));
    });
};
