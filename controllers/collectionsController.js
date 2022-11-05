const User = require("../models/users");
const Collections = require("../models/collections");
const FixedPriceMarket = require("../models/FixedPriceMarket");

exports.createCollection = (req, res) => {
  const { name, symbol, description, address, user_id } = req.body;
  const logoImg = req.files["logoImg"][0].filename;
  const bannerImg = req.files["bannerImg"][0].filename;
  User.findOne({ _id: user_id }).then((user) => {
    if (!user) {
      return res.status(400).json({ resp: "This user not found" });
    }
    newCollection = new Collections();
    newCollection.user_id = user_id;
    newCollection.name = name;
    newCollection.logoImg = logoImg;
    newCollection.bannerImg = bannerImg;
    newCollection.symbol = symbol;
    newCollection.description = description;
    newCollection.address = address;
    newCollection
      .save()
      .then(res.status(200).json({ resp: "success" }))
      .catch((err) => console.log(err));
  });
};

exports.getCollections = (req, res) => {
  Collections.find()
    .then((collections) => {
      res.status(200).json({ collections });
    })
    .catch((err) => console.log(err));
};

exports.fixedPriceMarket = (req, res) => {
  const { price, title, description, royalties, user_id } = req.body;
  const assets = req.files["assets"][0].filename;
  User.findOne({ _id: user_id }).then((user) => {
    if (!user) {
      return res.status(400).json({ resp: "This user not found" });
    }
    newItem = new FixedPriceMarket();
    newItem.user_id = user_id;
    newItem.price = price;
    newItem.title = title;
    newItem.royalties = royalties;
    newItem.description = description;
    newItem.assets = assets;
    newItem
      .save()
      .then(res.status(200).json({ resp: "success" }))
      .catch((err) => console.log(err));
  });
};
