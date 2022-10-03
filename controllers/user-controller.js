const User = require("../models/User");

exports.Register = (req, res) => {
    const params = req.body;
    User.findOne({ user_wallet_address: params.walletaddr }).then((user) => {
        if (user) {
            return res
                .status(200)
                .json({ resp: "This user already exists", user: user });
        }
        let newUser = new User();
        newUser.user_wallet_address = params.walletaddr;
        newUser
            .save()
            .then(res.status(200).json({ resp: "success", user: newUser }))
            .catch((err) => console.log(err));
    });
};

exports.editProfile = async (req, res) => {
    const {
        name,
        customeURL,
        email,
        bio,
        facebook,
        twitter,
        discord,
        walletaddr,
    } = req.body;
    const avatar = req.files["avatar"][0].filename;
    const coverImg = req.files["coverImg"][0].filename;
    //check
    try {
        const user = await User.findOne({ user_wallet_address: walletaddr });
        user.user_name = name;
        user.user_customeURL = customeURL;
        user.user_email = email;
        user.user_bio = bio;
        user.user_facebook = facebook;
        user.user_twitter = twitter;
        user.user_discord = discord;
        user.user_avatar = avatar;
        user.user_coverImg = coverImg;
        await user.save();
        res.json({ resp: "Update Success" });
    } catch (err) {
        res.status(500).json({ resp: "User not found" });
    }
};
