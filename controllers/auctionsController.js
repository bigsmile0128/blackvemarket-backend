const Logs = require("../models/logs");
const Auctions = require("../models/auctions");
const Offers = require("../models/offers");
const Collections = require("../models/collections");
const nftSchema = require("../models/nft_schema");

exports.test = async (req, res) => {
    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.query = JSON.stringify(req.query);
    newLogs.params = JSON.stringify(req.params);
    await newLogs.save();

    res.status(200).json({
        status: "success",
        body: JSON.stringify(req.body),
        query: JSON.stringify(req.query),
        params: JSON.stringify(req.params),
    });
};

exports.onCreatedAuction = async (req, res) => {
    const {
        saleId,
        wallet,
        contractAddr,
        tokenId,
        minPrice,
        fixedPrice,
        created,
        duration,
        txID,
    } = req.body;

    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.txID = txID;
    await newLogs.save();

    const newAuction = new Auctions();
    newAuction.saleId = saleId;
    newAuction.contractAddr = contractAddr;
    newAuction.tokenId = tokenId;
    newAuction.seller = wallet;
    newAuction.isAuction = minPrice > 0 ? true : false;
    newAuction.price = minPrice > 0 ? minPrice : fixedPrice;
    newAuction.startedAt = created;
    newAuction.duration = duration;
    newAuction.isFinished = false;

    await newAuction.save();

    res.status(200).json({
        status: "success",
    });
};

exports.onCanceledAuction = async (req, res) => {
    const { saleId, wallet, created, txID } = req.body;

    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.txID = txID;
    await newLogs.save();

    const auction = await Auctions.findOne({ saleId });
    auction.isFinished = true;
    await auction.save();

    res.status(200).json({
        status: "success",
    });
};

exports.onChangedAuctionPrice = async (req, res) => {
    const { saleId, wallet, price, created, txID } = req.body;

    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.txID = txID;
    await newLogs.save();

    const auction = await Auctions.findOne({ saleId });
    auction.price = price;
    await auction.save();

    res.status(200).json({
        status: "success",
    });
};

exports.onNewHighestOffer = async (req, res) => {
    const { saleId, wallet, amount, created, txID } = req.body;

    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.txID = txID;
    await newLogs.save();

    const auction = await Auctions.findOne({ saleId });
    const newOffer = new Offers();
    newOffer.auction_id = auction._id;
    newOffer.saleId = saleId;
    newOffer.buyer = wallet;
    newOffer.price = amount;
    newOffer.bidAt = created;
    await newOffer.save();

    res.status(200).json({
        status: "success",
    });
};

exports.onFixedBought = async (req, res) => {
    const { saleId, wallet, contractAddr, tokenId, amount, created, txID } =
        req.body;

    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.txID = txID;
    await newLogs.save();

    const auction = await Auctions.findOne({ saleId });
    auction.isFinished = true;
    await auction.save();

    res.status(200).json({
        status: "success",
    });
};

exports.onClaimed = async (req, res) => {
    const { saleId, wallet, contractAddr, tokenId, amount, created, txID } =
        req.body;

    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.txID = txID;
    await newLogs.save();

    const auction = await Auctions.findOne({ saleId });
    auction.isFinished = true;
    await auction.save();

    res.status(200).json({
        status: "success",
    });
};

exports.onNewSaleIdCreated = async (req, res) => {
    res.status(200).json({
        status: "success",
    });
};

exports.onSaleCXL = async (req, res) => {
    const { saleId, wallet, created, txID } = req.body;

    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.txID = txID;
    await newLogs.save();

    const auction = await Auctions.findOne({ saleId });
    auction.isFinished = true;
    await auction.save();

    res.status(200).json({
        status: "success",
    });
};

exports.onRefunded = async (req, res) => {
    res.status(200).json({
        status: "success",
    });
};

exports.onTransferNFT = async (req, res) => {
    const { from, to, tokenId, contractAddr, txID } = req.body;
    let msg = "normal";

    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.txID = txID;
    await newLogs.save();

    const collection = await Collections.findOne({ address: contractAddr });

    if (collection) {
        const nftModel = mongoose
            .model(collection["col_name"], nftSchema)
            .lean()
            .exec();
        if (from == "0") {
            message = "mint";
        } else {
            message = "transfer";
        }
    }

    res.status(200).json({
        status: "success",
        message,
    });
};
