const User = require("../models/users");

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

exports.editProfile = async (req, res) => {
    const { name, url, email, bio, walletaddr } = req.body;

    //check
    try {
        const user = await User.findOne({ address: walletaddr });
        user.name = name;
        user.url = url;
        user.email = email;
        user.bio = bio;
        if (req.files["avatar"]) user.avatar = req.files["avatar"][0].filename;
        await user.save();
        res.json({ resp: "Update Success", user: user });
    } catch (err) {
        res.status(500).json({ resp: "User not found" });
    }
};
