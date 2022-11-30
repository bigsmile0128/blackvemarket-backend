const User = require("../models/users");
const Collections = require("../models/collections");
const FixedPriceMarket = require("../models/FixedPriceMarket");
const { uriToHttp, uriToImage } = require("../utils");
const nftSchema = require("../models/nft_schema");
const mongoose = require("mongoose");
const { Framework } = require('@vechain/connex-framework')
const { Driver, SimpleNet } = require('@vechain/connex-driver')
const BlackVeMarket_JSON = require("../abis/BlackVeMarket.json")
const Auctions = require("../models/auctions");
const Offers = require("../models/offers");
const NFT_JSON = require("../abis/NFTs.json")
const Logs = require("../models/logs");
// import _ from 'lodash';
const _ = require("lodash");

const NFT_ABI = NFT_JSON.abi;

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
    let json = JSON.parse(meta_json);
    const nftModel = mongoose.model(col_name, nftSchema);
    await nftModel.create({
      token_id: token_id,
      // meta_uri: meta_json,
      name: '#' + token_id,
      description: '',
      // description: json.description,
      image: json.img,
      attributes: json.attributes,
      rank: json.rank,
      rarity: json.rarity
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
  const { col_name, start, limit, sort, filter } = req.body;

  try {
    const nftModel = mongoose.model(col_name, nftSchema);
    const collection = await Collections.findOne({ col_name }).lean().exec();
    let nfts = await nftModel.find({}).lean().exec();//.skip(start).limit(limit).lean().exec();

    const timeNow = Date.now() / 1000;
    const auctions = await Auctions.find({
      isFinished: false,
      contractAddr: collection["address"],
      isAuction: true,
      startedAt: {"$lt": timeNow},
      "$expr": {
        "$gt": [ {"$sum": ['$startedAt', '$duration']}, timeNow ],
      }
    }).lean().exec();
    const auctions_fixed = await Auctions.find({
      isFinished: false,
      contractAddr: collection["address"],
      isAuction: false
    }).lean().exec();
    const auctions_by_token_id = [];
    for ( const auction of auctions ) {
      auctions_by_token_id[auction["tokenId"]] = auction;
    }
    for ( const auction of auctions_fixed ) {
      auctions_by_token_id[auction["tokenId"]] = auction;
    }

    for ( var i = 0; i < nfts.length; i ++ ) {
      const nft = nfts[i];
      if ( auctions_by_token_id[nft["token_id"]] ) {
        nft["auction"] = auctions_by_token_id[nft["token_id"]];
        const highestOffer = await Offers.findOne({auction_id: auctions_by_token_id[nft["token_id"]]['_id']}).sort('-price').lean().exec();
        nft["offer"] = highestOffer;
        nft["price"] = highestOffer?nft["offer"]["price"]:nft["auction"]["price"];
        nfts[i] = nft;
      }
    }

    if ( filter == 1 ) {
      nfts = nfts.filter((item) => item.auction != null);
    }
    if ( sort == 0 ) {
      nfts = _.orderBy(nfts, 'token_id', 'asc');
    } else if ( sort == 1 ) {
      nfts = _.orderBy(nfts, 'token_id', 'desc');
    } else if ( sort == 2 ) {
      nfts = _.orderBy(nfts, ['rank', 'token_id'], ['asc', 'asc']);
    } else if ( sort == 3 ) {
      nfts = _.orderBy(nfts, ['rank', 'token_id'], ['desc', 'asc']);
    } else if ( sort == 4 ) {
      nfts = _.orderBy(nfts, 'price', 'asc');
    } else if ( sort == 5 ) {
      nfts = _.orderBy(nfts, [(o)=>o.price||0], 'desc');
    } else if ( sort == 6 ) {
      nfts = _.orderBy(nfts, [(o)=>o.auction?o.auction.startedAt:0], 'desc');
    }
    nfts = nfts.splice(start, limit);

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

const getTokenOwner = async (address, tokenId) => {
  const connex = await getConnex();

  const abiTokenURI = NFT_ABI.find(({name}) => name === "ownerOf");
  const result = await connex.thor
        .account(address)
        .method(abiTokenURI)
        .call(tokenId);

    return result.decoded[0];
}

exports.getItemAuction = async (req, res) => {
  const { address, token_id, event } = req.body;

  try {
    if ( event != 0 ) {
      const connex = await getConnex();
      while (true) {
        await connex.thor.ticker().next();
        const txIDLog = await Logs.findOne({txID: event}).lean().exec();
        if ( txIDLog && txIDLog.txID ) {
          break;
        }
      }
    }
    const owner = await getTokenOwner(address, token_id);
    
    const timeNow = Date.now() / 1000;
    const auction = await Auctions.findOne({
      contractAddr: address,
      tokenId: token_id,
      isFinished: false,
    }).sort('-startedAt');
    let isAuctionLive = false;
    if ( auction ) {
      isAuctionLive = auction['startedAt'] < timeNow && auction['startedAt'] + auction['duration'] > timeNow;
    }

    let ownerUser = null;
    if ( owner == BlackVeMarket_Address && auction ) {
      ownerUser = await User.findOne({ address: auction['seller'] }).lean().exec();
    } else {
      ownerUser = await User.findOne({ address: owner }).lean().exec();
    }
    const offers = auction && isAuctionLive?await Offers.find({auction_id: auction['_id']}).sort('-price').lean().exec():[];
    const highestOffer = offers.length > 0 ? offers[0] : null;

    for ( var i = 0; i < offers.length; i ++ ) {
      const userOffer = await User.findOne({ address: offers[i].buyer }).lean().exec();
      offers[i]['user'] = userOffer;
    }

    res.status(200).json({
      status: "success",
      owner,
      ownerUser,
      auction,
      offers,
      highestOffer,
      saleId: auction?auction['saleId']:0,
    });

  } catch (err) {
    console.log("model error ", err);
    res.status(400).json({
      status: "fail",
      msg: "getNFT failed",
    });
  }
}

exports.getItemDetails = async (req, res) => {
  const { col_name, token_id } = req.body;

  try {
    const nftModel = mongoose.model(col_name, nftSchema);
    const collection = await Collections.findOne({ col_name }).lean().exec();
    const details = await nftModel.findOne({ token_id: token_id }).lean().exec();

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
    const collection = await Collections.findOne({ address }).lean().exec();
    const nftModel = mongoose.model(collection['col_name'], nftSchema);
    const details = await nftModel.findOne({ token_id: token_id }).lean().exec();

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
        const nfts = await nftModel.find({}).skip(start).limit(limit).lean().exec();
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

exports.getCollections = async (req, res) => {
  const collections = await Collections.find().lean().exec();
  res.status(200).json({ collections });
};

exports.getCollection = async (req, res) => {
  const { symbol } = req.body;
  const collection = await Collections.findOne({ symbol }).lean().exec();

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
  const driver = await Driver.connect(new SimpleNet('https://mainnet.veblocks.net'))
  const connex = new Framework(driver)
  return connex
}

exports.getLiveAuctions = async (req, res) => {
  try {
    const timeNow = Date.now() / 1000;
    let auctions = await Auctions.find({
      isFinished: false,
      isAuction: true,
      startedAt: {"$lt": timeNow},
      "$expr": {
        "$gt": [ {"$sum": ['$startedAt', '$duration']}, timeNow ],
      }
    }).lean().exec();

    const liveAuctions = [];
    
    for ( const auction of auctions ) {
      const collection = await Collections.findOne({ address: auction['contractAddr'] }).lean().exec();
      const nftModel = mongoose.model(collection['col_name'], nftSchema);
      const details = await nftModel.findOne({ token_id: auction['tokenId'] }).lean().exec();
      const offer = await Offers.findOne({auction_id: auction['_id']}).sort('-price').lean().exec();
      liveAuctions.push({
          auctionSale: auction,
          saleId: auction['saleId'],
          offer,
          price: offer['price'],
          collection,
          details
      });
    }

    auctions = await Auctions.find({
      isFinished: false,
      isAuction: false,
    }).lean().exec();
    
    for ( const auction of auctions ) {
      const collection = await Collections.findOne({ address: auction['contractAddr'] }).lean().exec();
      const nftModel = mongoose.model(collection['col_name'], nftSchema);
      const details = await nftModel.findOne({ token_id: auction['tokenId'] }).lean().exec();
      liveAuctions.push({
          auctionSale: auction,
          saleId: auction['saleId'],
          offer: null,
          price: auction['price'],
          collection,
          details
      });
    }
    /*const connex = await getConnex();

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
    }*/

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