const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const app = express();

//Routes
const userRoutes = require("./routes/user.js");

app.use(bodyParser.json());
app.use(cors());
dotenv.config({ path: "./config/config.env" });

app.use(userRoutes);


const port = 3000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
    app.listen(port, () => {
      console.log(`server is started at ${port}`);
    });
  })
  .catch((err) => {
    console.log(err, "error in connecting db");
  });
