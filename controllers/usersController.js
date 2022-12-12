const User = require("../models/users");
const Collection = require("../models/collections");
const { Framework } = require('@vechain/connex-framework')
const { Driver, SimpleNet } = require('@vechain/connex-driver')
const NFT_JSON = require("../abis/NFTs.json")
const nftSchema = require("../models/nft_schema");
const mongoose = require("mongoose");
const { uploadFileToS3 } = require("../utils/aws");
const Auctions = require("../models/auctions");
const Offers = require("../models/offers");

const NFT_ABI = NFT_JSON.abi;

exports.register = (req, res) => {
    const { walletaddr } = req.body;
    User.findOne({ address: walletaddr }).then((user) => {
        if (user) {
            return res
                .status(200)
                .json({ resp: "This user already exists", user: user });
        }
        let newUser = new User();
        newUser.address = walletaddr;
        newUser
            .save()
            .then(res.status(200).json({ resp: "success", user: newUser }))
            .catch((err) => console.log(err));
    });
};

exports.getProfile = async (req, res) => {
    const { walletaddr } = req.body;

    try {
        const user = await User.findOne({ address: walletaddr });
        res.status(200).json({
            status: "success",
            user: user,
        });
    } catch (err) {
        res.status(500).json({ status: "fail", msg: "User not found" });
    }
};

const getConnex = async () => {
    const driver = await Driver.connect(new SimpleNet('https://mainnet.veblocks.net'))
    const connex = new Framework(driver)
    return connex
}

exports.getCollected = async (req, res) => {
    const { walletaddr } = req.params;
    // const walletaddr = "0x58b3157e5b63c76864562dff7f5f4c60b72e33cd";

    try {
        const collections = await Collection.find({ "type": { "$ne": "test" } }).lean().exec();
        const collection_by_address = [];

        /*const abiBalanceOf = NFT_ABI.find(({name}) => name === "balanceOf");
        const connex = await getConnex();*/

        const nft_list = [];

        for (const collection of collections) {
            collection_by_address[collection["address"].toLowerCase()] = collection;
            const nftModel = mongoose.model(collection.col_name, nftSchema);
            const nfts = await nftModel.find({ "owner": walletaddr.toLowerCase() }).lean().exec();

            for (const nft of nfts) {
                nft_list.push({
                    collection,
                    nft,
                    listed: false
                });
            }
        }

        /*for ( const collection of collections ) {
            collection_by_address[collection["address"].toLowerCase()] = collection;
            const resultCount = await connex.thor
                .account(collection.address)
                .method(abiBalanceOf)
                .call(walletaddr);

            const balanceOf = resultCount.decoded[0];

            if ( balanceOf > 0 ) {
                const abiWalletOfOwner = NFT_ABI.find(({name}) => name === "walletOfOwner");
                const resultWalletOfOwner = await connex.thor
                    .account(collection.address)
                    .method(abiWalletOfOwner)
                    .call(walletaddr);
                const walletOwner = resultWalletOfOwner.decoded[0];
                let nft_ids = [];

                if ( walletOwner && walletOwner.length == balanceOf ) {
                    nft_ids = walletOwner;
                } else {
                    const abiTokenOfOwnerByIndex = NFT_ABI.find(({name}) => name === "tokenOfOwnerByIndex" );
                    for ( var i = 0; i < balanceOf; i ++ ) {
                        const resultTokenOfOwnerByIndex = await connex.thor
                            .account(collection.address)
                            .method(abiTokenOfOwnerByIndex)
                            .call(walletaddr, i);
                        nft_ids.push(resultTokenOfOwnerByIndex.decoded[0]);
                    }
                }

                const nftModel = mongoose.model(collection.col_name, nftSchema);
                const nfts = await nftModel.find({"token_id": {"$in": nft_ids}}).lean().exec();

                for ( const nft of nfts ) {
                    nft_list.push({
                        collection,
                        nft,
                        listed: false
                    });
                }
            }
        }*/

        const auctions = await Auctions.find({
            seller: walletaddr,
            isFinished: false,
        }).sort('-startedAt').lean().exec();

        for (const auction of auctions) {
            const collection = collection_by_address[auction["contractAddr"].toLowerCase()];
            const nftModel = mongoose.model(collection.col_name, nftSchema);
            const nft = await nftModel.findOne({ "token_id": auction["tokenId"] }).lean().exec();
            const offer = await Offers.findOne({ auction_id: auction['_id'] }).sort('-price').lean().exec();
            nft_list.push({
                collection,
                nft,
                listed: true,
                auction,
                offer,
                price: offer ? offer['price'] : auction['price'],
            });
        }

        res.status(200).json({
            status: "success",
            walletaddr,
            nft_list,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: "fail", msg: "getCollected fails" });
    }
}

exports.editProfile = async (req, res) => {
    const { name, url, email, bio, twitter, instagram, walletaddr } = req.body;

    //check
    try {
        const user = await User.findOne({ address: walletaddr });
        user.name = name;
        user.url = url;
        user.email = email;
        user.bio = bio;
        user.twitter = twitter;
        user.instagram = instagram;
        if (req.files["avatar"]) {
            const file_on_s3 = await uploadFileToS3(req.files["avatar"][0], "avatar");
            user.avatar = file_on_s3;
        }
        await user.save();
        res.json({ resp: "Update Success", user: user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ resp: "User not found" });
    }
};
