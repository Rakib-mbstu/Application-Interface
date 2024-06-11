require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const apply = require("./server/models/licenseApplication");
const connectDB = require("./server/config/db");
const license = require("./server/models/licenseApplication");
const bodyParser = require("body-parser");
const initCall = require("./server/crypto/connector");

const app = express();
const PORT = process.env.PORT || 3000;

//database connection
connectDB();
// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());

// Route for the home page
app.get("/", async (req, res) => {
  res.render("index", { title: "Home" });
});

app.get("/list", async (req, res) => {
  const data = await license.find();
  res.render("list", { data: data });
});

app.post("/post", async (req, res) => {
  try {
    const newApplication = new license({
      name: req.body.name,
      proprietor: req.body.proprietor,
    });
    await license.create(newApplication);
  } catch (e) {
    res.send(e);
  }
  res.send("done");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
