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

exports.editProfile = async (req, res) => {
  const {
    name,
    customURL,
    email,
    bio,
    facebook,
    twitter,
    discord,
    walletaddr,
  } = req.body;
  console.log(req.body);

  console.log(req.files["avatar"][0].filename);
  const avatar = req.files["avatar"][0].filename;
  const coverImg = req.files["coverImg"][0].filename;
  //check
  try {
    const user = await User.findOne({ address: walletaddr });
    user.name = name;
    user.url = customURL;
    user.email = email;
    user.bio = bio;
    user.facebook = facebook;
    user.twitter = twitter;
    user.discord = discord;
    user.avatar = avatar;
    user.coverImg = coverImg;
    await user.save();
    res.json({ resp: "Update Success" });
  } catch (err) {
    res.status(500).json({ resp: "User not found" });
  }
};
