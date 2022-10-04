const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const path = require("path");
require("dotenv").config();
const app = express();
const url = process.env.MONGO_URL;
app.use(morgan("dev"));

//mongodb connect
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => console.log(err));

app.use(bodyParser.json({limit:"50mb"}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));
// app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, "public", "build")));
// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname, "public", "build", "index.html"));
// });
app.use(cors());

//define Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.listen(process.env.PORT || 9999, "0.0.0.0", () => {
  console.log(`Server started port 9999`);
});
