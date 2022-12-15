const fetch = require("node-fetch");
const Logs = require("../models/logs");
const Auctions = require("../models/auctions");
const Offers = require("../models/offers");
const Collections = require("../models/collections");
const nftSchema = require("../models/nft_schema");
const mongoose = require("mongoose");
const { Framework } = require("@vechain/connex-framework");
const { Driver, SimpleNet } = require("@vechain/connex-driver");
const BlackVeMarket_JSON = require("../abis/BlackVeMarket.json");
const BlackVeMarket_Address = BlackVeMarket_JSON.address;

exports.test = async (req, res) => {
    // const { from, to, tokenId, txID, clauseIndex } = req.body;
    const from = "0xD9E3d649F80b09942177bb905E61b35364E4138D";
    const to = "0xa6c48B784e7B96C4fDFB2Db33ECdDac43D733444";
    const tokenId = "1020";
    const txID = '0x7f18aedeeafea3c35c6bc9ab6410e35ed1849e97729dc81bfb77760501f260cc';
    const clauseIndex = 1;

    try {
        const connex = await getConnex();
        const txVisitor = connex.thor.transaction(txID);
        const transactionData = await txVisitor.get();
        const clause = transactionData["clauses"][clauseIndex];
        let contract_address = clause["to"];

        if (clauseIndex > 0 && contract_address == BlackVeMarket_Address) {
            contract_address = transactionData["clauses"][0]["to"];
        }

        console.log(contract_address);
        /*const collection = await Collections.findOne({
            address: contract_address,
        });
        console.log(collection);

        if (collection) {
            const nftModel = mongoose.model(collection["col_name"], nftSchema);
            console.log('1')
            if (from === "0x0000000000000000000000000000000000000000") {
                let meta_uri = collection["meta_uri"];
                let image_uri = collection["image_uri"];
                if (meta_uri) {
                    meta_uri = meta_uri.replace("{id}", tokenId);
                    image_uri = image_uri.replace("{id}", tokenId);

                    let meta_json;
                    await fetch(meta_uri)
                        .then((data) => data.json())
                        .then((data) => {
                            meta_json = data;
                        })
                        .catch((err) => console.log(err));

                    await nftModel.create({
                        token_id: tokenId,
                        name: meta_json?.name ? meta_json?.name : "#" + tokenId,
                        description: meta_json?.description ?? "",
                        image: image_uri,
                        attributes: meta_json?.attributes,
                        rank: meta_json?.rank,
                        rarity: meta_json?.rarity,
                        owner: to.toLowerCase(),
                    });

                    await Collections.updateOne({ address: contract_address }, { $set: { total_supply: collection["total_supply"] * 1 + 1 } });
                }
            } else if (to === "0x0000000000000000000000000000000000000000") {
                await nftModel.deleteOne({ token_id: tokenId });
            } else {
                console.log('2')
                await nftModel.updateOne(
                    { token_id: tokenId },
                    { $set: { owner: to.toLowerCase() } }
                );
            }
        }*/

        res.status(200).json({
            status: "success",
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: "fail",
            msg: "test failed",
            err,
        });
    }
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

const getConnex = async () => {
    const driver = await Driver.connect(
        new SimpleNet("https://mainnet.veblocks.net")
    );
    const connex = new Framework(driver);
    return connex;
};

exports.onTransferNFT = async (req, res) => {
    const { from, to, tokenId, txID, clauseIndex } = req.body;

    try {

        let newLogs = new Logs();
        newLogs.body = JSON.stringify(req.body);
        newLogs.txID = txID;
        await newLogs.save();

        const connex = await getConnex();
        const txVisitor = connex.thor.transaction(txID);
        const transactionData = await txVisitor.get();
        const clause = transactionData["clauses"][clauseIndex];
        const contract_address = clause["to"];

        if (clauseIndex > 0 && contract_address == BlackVeMarket_Address) {
            contract_address = transactionData["clauses"][0]["to"];
        }

        const collection = await Collections.findOne({
            address: contract_address,
        });

        if (collection) {
            const nftModel = mongoose.model(collection["col_name"], nftSchema);
            if (from === "0x0000000000000000000000000000000000000000") {
                let meta_uri = collection["meta_uri"];
                let image_uri = collection["image_uri"];
                if (meta_uri) {
                    meta_uri = meta_uri.replace("{id}", tokenId);
                    image_uri = image_uri.replace("{id}", tokenId);

                    let meta_json;
                    await fetch(meta_uri)
                        .then((data) => data.json())
                        .then((data) => {
                            meta_json = data;
                        })
                        .catch((err) => console.log(err));

                    await nftModel.create({
                        token_id: tokenId,
                        name: meta_json?.name ? meta_json?.name : "#" + tokenId,
                        description: meta_json?.description ?? "",
                        image: image_uri,
                        attributes: meta_json?.attributes,
                        rank: meta_json?.rank,
                        rarity: meta_json?.rarity,
                        // owner: to.toLowerCase(),
                    });

                    await Collections.updateOne({ address: contract_address }, { $set: { total_supply: collection["total_supply"] * 1 + 1 } });
                }
            } else if (to === "0x0000000000000000000000000000000000000000") {
                await nftModel.deleteOne({ token_id: tokenId });
            } else {
                // await nftModel.updateOne(
                //     { token_id: tokenId },
                //     { $set: { owner: to.toLowerCase() } }
                // );
            }
        }

        res.status(200).json({
            status: "success",
        });
    } catch (err) {
        let newLogs = new Logs();
        newLogs.body = JSON.stringify(req.body);
        newLogs.txID = txID;
        newLogs.success = false;
        newLogs.msg = err;
        await newLogs.save();

        console.log(err);
        res.status(400).json({
            status: "fail",
            msg: "onTransferNFT failed",
            err,
        });
    }
};
