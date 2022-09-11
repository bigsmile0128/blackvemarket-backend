module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const admins = require("../controllers/admin.controller.js");

  var router = require("express").Router();

  // Create a new NFT
  router.post("/signup", users.create);  
  router.post("/signin", users.signin);
  router.post("/admin/signin", admins.signin);

  // Retrieve all NFTs
  // router.get("/", NFTs.findAll);

  // // Retrieve all published NFTs
  // router.get("/published", NFTs.findAllPublished);

  // // Retrieve a single NFT with id
  // router.get("/:id", NFTs.findOne);

  // // Update a NFT with id
  // router.put("/:id", NFTs.update);

  // // Delete a NFT with id
  // router.delete("/:id", NFTs.delete);

  // // Delete all NFTs
  // router.delete("/", NFTs.deleteAll);

  app.use('/api', router);
};
