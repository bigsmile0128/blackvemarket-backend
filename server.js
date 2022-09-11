const express = require("express");
const cors = require("cors");
const app = express();
const config = require("./app/config/index");   /// This contains database access infoes(private), 

var corsOptions = {
  origin: "*"  ///This is to allow the port of frontend , we use port :3000
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/user.routes.js")(app);
// set port, listen for requests
const PORT = process.env.PORT || config.expressPort;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


