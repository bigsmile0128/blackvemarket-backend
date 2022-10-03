const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const Intervention = require("../models/Intervention");
const Tier = require("../models/Tier");
const User = require("../models/User");
const Company = require("../models/Company");
const multer = require("multer");
var path = require("path");
var fs = require("fs");

const AdmZip = require("adm-zip");

const __basedir = path.resolve("./");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 },
});

var uploadDir = fs.readdirSync(__basedir + "/public/upload");

// const upload = multer({ dest: "public/upload" });

//@route    POST api/create
//@desc     Create a intervention
//@access   Private
const multiUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "file[]", maxCount: 10 },
  { name: "nft_image", maxCount: 1 },
]);
router.post("/create", multiUpload, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ resp: errors.array() });
  }
  const image = req.files["image"][0].filename;

  let file = [];
  for (var i = 0; i < req.files["file[]"].length; i++) {
    let file_data = {
      filename: req.files["file[]"][i].filename,
      mimetype: req.files["file[]"][i].mimetype,
    };
    file.push(file_data);
  }
  //let file = req.files["file"][0].filename;
  const nft_image = req.files["nft_image"][0].filename;
  const {
    name,
    description,
    token_amount,
    wallet_address,
    nft_name,
    nft_description,
    nft_price,
    project_name,
    project_description,
    project_id,
    event_type,
    project_country,
    credit_type,
    methodology,
    value_chain,
    shed_name,
    beneficiary,
    reduction_purpose,
    country_of_consumption,
    vintage,
    verified_by,
    date_of_verification,
    date_of_issue,
  } = req.body;
  try {
    let intervention = await Intervention.findOne({ name });
    if (intervention) {
      return res.status(400).json({ resp: "Intervention already exists" });
    }
    intervention = new Intervention({
      name,
      description,
      image,
      token_amount,
      wallet_address,
      file,
      nft_name,
      nft_description,
      nft_price,
      nft_image,
      project_name,
      project_description,
      project_id,
      event_type,
      project_country,
      credit_type,
      methodology,
      value_chain,
      shed_name,
      beneficiary,
      reduction_purpose,
      country_of_consumption,
      vintage,
      verified_by,
      date_of_verification,
      date_of_issue,
    });
    await intervention
      .save()
      .then((intervention) => {
        res.status(200).json({ intervention: intervention });
      })
      .catch((error) => {
        console.error(error.message);
        return res.status(400).json({ resp: "Intervention does not save" });
      });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ resp: "Server error" });
  }
});
//@route    GET api/all
//@desc     Get all interventions
//@access   Private
router.get("/all", async (req, res) => {
  try {
    const interventions = await Intervention.find();
    res.status(200).json({ interventions });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ resp: "Server error" });
  }
});

//@route    GET api/details/intervention_id
//@desc     get intervention_id
//@access   Private
router.get("/details/:intervention_id", async (req, res) => {
  const { intervention_id } = req.params;
  try {
    const intervention = await Intervention.findById(intervention_id);
    if (!intervention) {
      return res.status(400).json({ resp: "No intervention" });
    } else {
      res.status(200).json({ intervention });
    }
  } catch (errors) {
    console.log(errors.message);
    return res.status(500).json({ resp: "Server error" });
  }
});

//@route    POST api/download
//@desc     file download
//@access   Private
router.get("/download/:intervention_id", async (req, res) => {
  const { intervention_id } = req.params;

  Intervention.findOne({ _id: intervention_id }).then((intervention) => {
    if (intervention) {
      const zip = new AdmZip();

      for (var i = 0; i < intervention.file.length; i++) {
        zip.addLocalFile(
          __basedir + "/public/upload/" + intervention.file[i].filename
        );
      }

      // Define zip file name
      const downloadName = `${Date.now()}.zip`;
      // zip.writeZip(__basedir+"/public/"+downloadName);
      const data = zip.toBuffer();

      res.set("Content-Type", "application/octet-stream");
      res.set("Content-Disposition", `attachment; filename=${downloadName}`);
      res.set("Content-Length", data.length);
      res.send(data);
    }
  });
});

//@route    POST api/all
//@desc     Get all Data
//@access   Private
router.get("/total", async (req, res) => {
  let users = await User.find();
  let result = await Promise.all(
    users.map(async (user) => {
      let user_id = user._id;
      let tmpUser = user.toObject();
      switch (user.user_role) {
        case "1":
          tmpUser.interventions = "admin";
          break;
        case "2":
          tmpUser.tier = await Tier.aggregate([
            {
              $match: {
                user_id,
              },
            },
            {
              $lookup: {
                from: "interventions",
                localField: "intervention_id",
                foreignField: "_id",
                as: "intervention",
              },
            },
          ]);
          break;
        case "3":
          tmpUser.company = await Company.aggregate([
            {
              $match: {
                user_id,
              },
            },
            {
              $lookup: {
                from: "tiers",
                let: { id: "$tier_id" },
                as: "tier",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$id", "$_id"],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "interventions",
                      localField: "intervention_id",
                      foreignField: "_id",
                      as: "intervention",
                    },
                  },
                ],
              },
            },
          ]);
          break;
      }
      return tmpUser;
    })
  );
  res.status(200).json({ users: result });
});

module.exports = router;
