const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const apiRouter = require("./routes/api-router");

require("dotenv").config();

const app = express();
const http = require("http").createServer(app);

//mongodb connect
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => console.log(err));

app.use(morgan("dev"));
app.use(express.json());

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(
//   bodyParser.urlencoded({
//     limit: "50mb",
//     extended: true,
//     parameterLimit: 50000,
//   })
// );
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, "public", "build")));
// app.get("/", function (req, res) {
//     res.sendFile(path.join(__dirname, "public", "build", "index.html"));
// });
app.use(cors());

//define Routes
app.use("/api/v1", apiRouter);

http.listen(3333, () => {
  console.log(`client started port 3333`);  
});
app.listen(process.env.PORT || 9999, "0.0.0.0", () => {
  console.log(`Server started port 9999`);
});
