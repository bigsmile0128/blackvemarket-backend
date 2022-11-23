const User = require("../models/users");
const Collections = require("../models/collections");
const FixedPriceMarket = require("../models/FixedPriceMarket");
const { uriToHttp, uriToImage } = require("../utils");
const nftSchema = require("../models/nft_schema");
const mongoose = require("mongoose");
const { Framework } = require('@vechain/connex-framework')
const { Driver, SimpleNet } = require('@vechain/connex-driver')
const BlackVeMarket_JSON = require("../abis/BlackVeMarket.json")

const BlackVeMarket_ABI = BlackVeMarket_JSON.abi;
const BlackVeMarket_Address = BlackVeMarket_JSON.address;

const convertMapToStringKey = (data) => {
  const result = [];
  for (const item of data) {
    var obj = {};
    for (const key in item) {
      obj[key.toString()] = item[key];
    }
    result.push(obj);
  }
  return result;
};

exports.addNFT = async (req, res) => {
  const { col_name, meta_json, token_id } = req.body;

  try {
    // let json = JSON.parse(meta_json);
    const nftModel = mongoose.model(col_name, nftSchema);
    await nftModel.create({
      token_id: token_id,
      meta_uri: meta_json,
      // name: json.name,
      // description: json.description,
      // image: json.image,
      // attributes: json.attributes
    });
  } catch (err) {
    console.log("model error ", err);
  }
  res.status(200).json({
    status: "success",
  });
};

exports.updateNFT = async (req, res) => {
  const { col_name, token_id } = req.body;

  try {
    const nftModel = mongoose.model(col_name, nftSchema);
    await nftModel.updateOne({token_id: token_id}, {$set: {valid: true}});
  } catch (err) {
    console.log("model error ", err);
  }
  res.status(200).json({
    status: "success",
  });
};

exports.getNFTs = async (req, res) => {
  const { col_name, start, limit, sort } = req.body;

  try {
    const nftModel = mongoose.model(col_name, nftSchema);
    let sortFilter = {id: 1};
    if ( sort == 0 ) {
      sortFilter = {token_id: 1};
    } else if ( sort == 1 ) {
      sortFilter = {token_id: -1};
    } else if ( sort == 2 ) {
      sortFilter = {rarity: 1};
    } else if ( sort == 3 ) {
      sortFilter = {rarity: -1};
    }
    const nfts = await nftModel.find({}).sort(sortFilter).skip(start).limit(limit);

    res.status(200).json({
      status: "success",
      nfts,
    });
  } catch (err) {
    console.log("model error ", err);
    res.status(400).json({
      status: "fail",
      msg: "getNFT failed",
    });
  }
};

exports.getItemDetails = async (req, res) => {
  const { col_name, token_id } = req.body;

  try {
    const nftModel = mongoose.model(col_name, nftSchema);
    const collection = await Collections.findOne({ col_name });
    const details = await nftModel.findOne({ token_id: token_id });

    res.status(200).json({
      status: "success",
      details,
      collection,
    });
  } catch (err) {
    console.log("model error ", err);
    res.status(400).json({
      status: "fail",
      msg: "getNFT failed",
    });
  }
};

exports.getNFTInfo = async (req, res) => {
  const { address, token_id } = req.body;

  try {
    const collection = await Collections.findOne({ address });
    const nftModel = mongoose.model(collection['col_name'], nftSchema);
    const details = await nftModel.findOne({ token_id: token_id });

    res.status(200).json({
      status: "success",
      details,
      collection,
    });
  } catch (err) {
    console.log("model error ", err);
    res.status(400).json({
      status: "fail",
      msg: "getNFT failed",
    });
  }
};

exports.getAllNfts = async (req, res) => {
  const { col_names, start, limit } = req.body;
  const allnfts = [];

  console.log(start, limit);
  try {
    await Promise.all(
      col_names.map(async (item) => {
        const nftModel = mongoose.model(item.field, nftSchema);
        const nfts = await nftModel.find({}).skip(start).limit(limit);
        allnfts.push(...nfts);
      })
    );
    res.status(200).json({
      status: "success",
      allnfts,
    });
  } catch (err) {
    console.log("model error ", err);
    res.status(404).json({
      status: "fail",
      msg: "getAllNFTs failed",
    });
  }
};

exports.createCollection = (req, res) => {
  const { name, symbol, description, address, user_id, total_supply } = req.body;
  User.findOne({ _id: user_id }).then((user) => {
    if (!user) {
      return res.status(400).json({ resp: "This user not found" });
    }
    newCollection = new Collections();
    newCollection.user_id = user_id;
    newCollection.name = name;
    if (req.files["logoImg"])
      newCollection.logoImg = req.files["logoImg"][0].filename;
    if (req.files["bannerImg"])
      newCollection.bannerImg = req.files["bannerImg"][0].filename;
    if (req.files["featureImg"])
      newCollection.featureImg = req.files["featureImg"][0].filename;
    newCollection.symbol = symbol;
    newCollection.description = description;
    newCollection.address = address;
    newCollection.col_name = name.replaceAll(" ", "_").toLowerCase();
    newCollection.total_supply = total_supply;
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

exports.getCollection = async (req, res) => {
  const { symbol } = req.body;
  const collection = await Collections.findOne({ symbol });

  res.status(200).json({
    status: "success",
    collection,
  });
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

const getConnex = async () => {
  const driver = await Driver.connect(new SimpleNet('https://testnet.veblocks.net'))
  const connex = new Framework(driver)
  return connex
}

exports.getLiveAuctions = async (req, res) => {
  try {
    const connex = await getConnex();

    const abiSalesCount = BlackVeMarket_ABI.find(({name}) => name === "salesCount");
          
    const resultCount = await connex.thor
        .account(BlackVeMarket_Address)
        .method(abiSalesCount)
        .call();
    
    const salesCount = resultCount.decoded[0];
    const liveAuctions = [];

    for ( var i = 0; i < salesCount; i ++ ) {
        const abiSaleList = BlackVeMarket_ABI.find(({name}) => name === "saleList");
        
        const result = await connex.thor
            .account(BlackVeMarket_Address)
            .method(abiSaleList)
            .call(i + 1);
        const auctionSale = result.decoded;
        if ( auctionSale && ((auctionSale.minPrice > 0 && auctionSale.duration > 0 && auctionSale.startedAt * 1000 + auctionSale.duration * 1000 >= Date.now()) || auctionSale.fixedPrice > 0) && auctionSale.finalPrice == 0 ) {
            const abiHighestOffers = BlackVeMarket_ABI.find(({name}) => name === "highestOffers");

            const result = await connex.thor
                .account(BlackVeMarket_Address)
                .method(abiHighestOffers)
                .call(i + 1);

            const offer = result.decoded;

            const collection = await Collections.findOne({ address: auctionSale.contractAddr });
            const nftModel = mongoose.model(collection['col_name'], nftSchema);
            const details = await nftModel.findOne({ token_id: auctionSale.tokenId });

            liveAuctions.push({
                auctionSale,
                saleId: i + 1,
                offer,
                collection,
                details
            });
        }
    }

    res.status(200).json({
      status: "success",
      liveAuctions,
    });

  } catch (err) {
    console.log("error", err);
    res.status(400).json({
      status: "fail",
      msg: "getLiveAuctions failed",
    });
  }
}