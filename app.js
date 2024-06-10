const express = require("express");
const path = require("path");
const apply = require("./models/application");

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route for the home page
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.get("/list", (req, res) => {
  res.render("list");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
