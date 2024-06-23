require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const apply = require("./server/models/licenseApplication");
const connectDB = require("./server/config/db");
const license = require("./server/models/licenseApplication");
const bodyParser = require("body-parser");
const initCall = require("./server/crypto/connector");
const User = require("./server/models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
const jwtSecret = process.env.jwtSecret;
const cryptoPath = require("./server/models/cryptoPath");
const dConnector = require("./server/crypto/dynamicConnector");
const { runInNewContext } = require("vm");
//
const app = express();
const PORT = process.env.PORT || 3000;

//database connection
connectDB();
// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    console.log(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Route for the home page
app.get(["/", "/home"], async (req, res) => {
  //res.render("index", { title: "Home" });
  res.render("login");
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid" });
    }
    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/list");
  } catch (error) {
    console.log(error);
  }
});
// app.post("/register", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     console.log(password);
//     const hashPassword = await bcrypt.hash(password, 10);
//     try {
//       const user = await User.create({
//         username: username,
//         password: hashPassword,
//       });
//       console.log(user);
//       res.status(201).json({ message: "user created" });
//     } catch (error) {
//       console.log(error);
//       if (error == 11000) {
//         res.status(409).json({ message: "Already in Use" });
//       }
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

//list of non approved applications
app.get("/list", authMiddleware, async (req, res) => {
  const data = await license.find({ approved: false });
  res.render("list", { data: data });
});

//license application
app.get("/addLicense", async (req, res) => {
  res.render("licenseApplication");
});
app.post("/addLicense", async (req, res) => {
  try {
    const newApplication = new license({
      name: req.body.name,
      proprietor: req.body.proprietor,
    });
    await license.create(newApplication);
    res.render("success", { data: newApplication });
  } catch (e) {
    res.send(e);
  }
});

//approval in blockchain
app.get("/approve/:id", authMiddleware, async (req, res) => {
  try {
    const data = await license.findById(req.params.id);
    res.render("approval", { application: data });
  } catch (e) {
    res.send(e);
  }
});
app.post("/approve", authMiddleware, async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const proprietor = req.body.proprietor;
  const remarks = req.body.remarks;
  try {
    await license.findByIdAndUpdate(id, { approved: true });
    const dPath = await cryptoPath.findOne({ userId: req.userId });
    await dConnector.createLicenseCall(dPath, id, name, proprietor, remarks);
    res.render("appSuccess", { id, name, proprietor, remarks });
  } catch (e) {
    res.send(e);
  }
});

//addPath
// app.post("/addPath", async (req, res) => {
//   const {userId, mspId, dirName, keyPath, certPath, tlsPath, peerPoint, peerHost } =
//     req.body;
//   try {
//     const newPath = new cryptoPath({
//       userId:userId,
//       mspId: mspId,
//       dirName: dirName,
//       keyPath: keyPath,
//       certPath: certPath,
//       tlsPath: tlsPath,
//       peerPoint: peerPoint,
//       peerHost: peerHost,
//     });
//     await cryptoPath.create(newPath);
//     console.log(newPath);
//   } catch (e) {
//     res.send(e);
//   }
//   console.log(keyPath);
//   res.send("done");
// });

app.get("/appLicenses",authMiddleware, async (req, res) => {
  try {
    const data = await cryptoPath.findById("666977c7b63ef75782c999b4");
    console.log(data);
    const allLicenses = await dConnector.getLicenses(data);
    const licenses = allLicenses.flatMap((item) =>
      Array.isArray(item) ? item : [item]
    );
    res.render("approvedLicense", { licenses });
  } catch (e) {
    res.send(e);
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
