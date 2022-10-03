const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const Tier = require("../models/Tier");
const Intervention = require("../models/Intervention");
const Company = require("../models/Company");
const User = require("../models/User");
const multer = require("multer");
const nodemailer = require("nodemailer");

const upload = multer({ dest: "public/upload/" });

//@route    POST api/create
//@desc     Create a tier
//@access   Private
router.post("/create", upload.single("tier_image"), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ resp: errors.array() });
  }
  const tier_image = req.file.filename;
  const {
    tier_name,
    tier_description,
    intervention_id,
    tier_wallet_address,
    tier_is_claim,
    tier_private_key,
    user_name,
    user_email,
    user_password,
  } = req.body;
  try {
    let tier = await Tier.findOne({ tier_name });
    if (tier) {
      return res.status(400).json({ resp: "Tier already exists" });
    }
    let intervention = await Intervention.findById(intervention_id);
    if (!intervention) {
      return res.status(400).json({ resp: "Intervention can not find" });
    }
    let user_id = "";
    let user = await User.findOne({ user_email: user_email });
    if (!user) {
      let newUser = new User();
      newUser.user_name = user_name;
      newUser.user_password = user_password;
      newUser.user_email = user_email;
      newUser.user_role = "2";
      newUser.user_wallet_address = "";
      await newUser
        .save()
        .then((user) => {
          user_id = user._id;
        })
        .catch((err) => console.log(err));
    } else {
      // user_id = user._id;
      return res.status(400).json({ resp: "This user already exists." });

    }
    const tier_token_amount = intervention.token_amount;
    tier = new Tier({
      intervention_id,
      user_id,
      tier_name,
      tier_description,
      tier_wallet_address,
      tier_token_amount,
      tier_is_claim,
      tier_image,
      tier_private_key,
    });
    tier
      .save()
      .then((tier) => {
        res.status(200).json({ tier: tier });
      })
      .catch(() => {
        return res.status(400).json({ resp: "tier does not save" });
      });
  } catch (error) {
    return res.status(500).json({ resp: "Server error" });
  }
});

//@route    GET api/all
//@desc     get all tiers
//@access   Private
router.get("/all", async (req, res) => {
  try {
    const tiers = await Tier.find();
    res.status(200).json({ tiers });
  } catch (errors) {
    console.log(errors.message);
    return res.status(500).json({ resp: "Server error" });
  }
});
//@route    GET api/intervention_id
//@desc     get intevention_id tiers
//@access   Private
router.get("/:intervention_id", async (req, res) => {
  const intervention_id = req.params.intervention_id;
  // console.log(intervention_id);
  try {
    const tiers = await Tier.find({ intervention_id });
    if (!tiers) {
      return res.status(400).json({ resp: "No tier" });
    } else {
      res.status(200).json({ tiers });
    }
  } catch (errors) {
    console.log(errors.message);
    return res.status(500).json({ resp: "Server error" });
  }
});
//@route    GET api/user/user_id
//@desc     get user_id tiers
//@access   Private
router.get("/user/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const tiers = await Tier.find({ user_id });
    if (!tiers) {
      return res.status(400).json({ resp: "No tier" });
    } else {
      res.status(200).json({ tiers });
    }
  } catch (errors) {
    console.log(errors.message);
    return res.status(500).json({ resp: "Server error" });
  }
});

//@route    GET api/details/tier_id
//@desc     get tier_id
//@access   Private
router.get("/details/:tier_id", async (req, res) => {
  const { tier_id } = req.params;
  try {
    const tier = await Tier.findById(tier_id);
    if (!tier) {
      return res.status(400).json({ resp: "No tier" });
    } else {
      res.status(200).json({ tier });
    }
  } catch (errors) {
    console.log(errors.message);
    return res.status(500).json({ resp: "Server error" });
  }
});

//@route    GET api/transfer
//@desc     get tier_id
//@access   Private
// router.post("/transfer", async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   const { firstTransfer, secondTransfer, transferAmount } = req.body;
//   try {
//     let firstTier = await Tier.findById(firstTransfer);
//     let secondTier = await Tier.findById(secondTransfer);
//     if (!firstTier || !secondTier) {
//       return res.status(400).send("No Transfer");
//     }
//     if (firstTier.tier_is_claim === true) {
//       return res.status(400).send("Claimed Never Transfer");
//     }
//     if (firstTier.tier_token_amount < transferAmount) {
//       return res.status(400).send("Don't enough token");
//     }
//     firstTier.tier_token_amount -= Number(transferAmount);
//     secondTier.tier_token_amount += Number(transferAmount);
//     console.log(secondTier.tier_token_amount);
//     firstTier.save();
//     secondTier
//       .save()
//       .then((data) => {
//         res.status(200).send("Success");
//       })
//       .catch((error) => {
//         res.status(400).send("Save Failed");
//       });
//   } catch (errors) {
//     console.log(errors.message);
//     return res.status(500).json({ resp: "Server error" });
//   }
// });

//@route    GET api/claim
//@desc     get tier_id
//@access   Private
// router.post("/claim/:tier_id", async (req, res) => {
//   const { tier_id } = req.params;
//   try {
//     const tier = await Tier.findById(tier_id);
//     if (!tier) {
//       res.status(400).send("No Tier");
//     } else {
//       tier.tier_is_claim = false;
//       tier
//         .save()
//         .then((data) => {
//           res.status(200).send("Success");
//         })
//         .catch((error) => {
//           res.status(400).send("Save Failed");
//         });
//     }
//   } catch (errors) {
//     console.log(errors.message);
//     return res.status(500).json({ resp: "Server error" });
//   }
// });

//@route    GET api/allocate
//@desc     get tier_id
//@access   Private
router.post("/allocate", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ resp: errors.array() });
  }
  const { firstTransfer, secondTransfer, transferAmount } = req.body;
  try {
    let firstTier = await Tier.findById(firstTransfer);
    let secondTier = await Company.findById(secondTransfer);
    if (!firstTier || !secondTier) {
      return res.status(400).json({ resp: "No Transfer" });
    }
    if (firstTier.tier_token_amount < transferAmount) {
      return res.status(400).json({ resp: "Don't enough token" });
    }
    firstTier.tier_token_amount -= Number(transferAmount);
    secondTier.company_token_amount += Number(transferAmount);
    console.log(secondTier.company_token_amount);
    firstTier.save();
    secondTier
      .save()
      .then((data) => {
        res.status(200).send("Success");
      })
      .catch((error) => {
        return res.status(400).json({ resp: "Save Failed" });
      });
  } catch (errors) {
    console.log(errors.message);
    return res.status(500).json({ resp: "Server error" });
  }
});
module.exports = router;
