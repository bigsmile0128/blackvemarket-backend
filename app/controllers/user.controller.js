const User = require("../models/user.model.js");

// Create and Save a new nft
exports.create = (req, res) => {
  // Validate request
  const email = req.body.email;
  User.getAll(email, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving nfts."
      });
    else {
      if(data.length === 0){
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
      
        // Save nft in the database
        User.create(user, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the nft."
            });
          else res.send(data);
        });
      }
      else {
        res.send("Repeated this email")
      }  
    } 
      
  });

  // Create a nft
  
};

exports.signin = (req, res) => {
  email = req.body.email;
  password = req.body.password;
  User.getAll(email, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving nfts."
      });
    else {
      if(data.length === 0){
        res.send("Please register.")
      }
      else {        
        if(password === data[0].password){
          res.send(data)
        }
          
        else
          res.send("Password Incorrect!")  
      }  
    } 
  });  
};
// Retrieve all nfts from the database (with condition).
exports.findAll = (req, res) => {
  console.log("perfect")
  const title = req.query.title;

  nft.getAll(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving nfts."
      });
    else res.send(data);
  });
};

// Find a single nft by Id
exports.findOne = (req, res) => {
  nft.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found nft with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving nft with id " + req.params.id
        });
      }
    } else res.send(data);
  });
};

// find all published nfts
exports.findAllPublished = (req, res) => {
  nft.getAllPublished((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving nfts."
      });
    else res.send(data);
  });
};

// Update a nft identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  nft.updateById(
    req.params.id,
    new nft(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found nft with id ${req.params.id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating nft with id " + req.params.id
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a nft with the specified id in the request
exports.delete = (req, res) => {
  nft.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found nft with id ${req.params.id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete nft with id " + req.params.id
        });
      }
    } else res.send({ message: `nft was deleted successfully!` });
  });
};

// Delete all nfts from the database.
exports.deleteAll = (req, res) => {
  nft.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all nfts."
      });
    else res.send({ message: `All nfts were deleted successfully!` });
  });
};
