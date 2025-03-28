const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { Canvas, Image, ImageData, createCanvas, loadImage } = require("canvas");
import * as faceapi from "face-api.js";
const User = require("./models/Users");
var cors = require("cors");
var path = require("path");
const fs = require("fs");
var jwt = require("jsonwebtoken");
var md5 = require("md5");
const fsp = require("fs").promises;

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/temp/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadTemp = multer({ storage: tempStorage });

const upload = multer({ storage });

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk("modelss");
  await faceapi.nets.faceLandmark68Net.loadFromDisk("modelss");
  await faceapi.nets.faceRecognitionNet.loadFromDisk("modelss");
}

app.post("/api/login", uploadTemp.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No image uploaded" });
    }

    const { email, pass } = req.body;
    if (!email || !pass) {
      await fsp.unlink(req.file.path).catch(console.error);
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      await fsp.unlink(req.file.path).catch(console.error);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.pass !== md5(pass)) {
      await fsp.unlink(req.file.path).catch(console.error);
      return res
        .status(401)
        .json({ success: false, error: "Wrong Credentials" });
    }

    if (!user.photoPath) {
      await fsp.unlink(req.file.path).catch(console.error);
      return res
        .status(400)
        .json({ success: false, error: "User has no registered photo" });
    }

    const [uploadedImage, userImage] = await Promise.all([
      loadImage(req.file.path),
      loadImage(user.photoPath),
    ]);

    const uploadedCanvas = createCanvas(
      uploadedImage.width,
      uploadedImage.height
    );
    const uploadedCTX = uploadedCanvas.getContext("2d");
    uploadedCTX.drawImage(uploadedImage, 0, 0);

    const userCanvas = createCanvas(userImage.width, userImage.height);
    const userCTX = userCanvas.getContext("2d");
    userCTX.drawImage(userImage, 0, 0);

    await loadModels();

    const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({
      minConfidence: 0.5,
    });

    const [upFace, savFace] = await Promise.all([
      faceapi
        .detectSingleFace(uploadedCanvas, faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor(),
      faceapi
        .detectSingleFace(userCanvas, faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor(),
    ]);

    if (!upFace || !savFace) {
      await fsp.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        error: "Face not detected in one or both images",
      });
    }

    const faceMatcher = new faceapi.FaceMatcher(savFace);
    const bestMatch = faceMatcher.findBestMatch(upFace.descriptor);

    await fsp.unlink(req.file.path).catch(console.error);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "qwertyuiop",
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      success: true,
      data: {
        matches: bestMatch,
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Error:", error);

    if (req.file?.path) {
      await fsp.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/signup", upload.single("photo"), async (req, res) => {
  try {
    const { email, pass } = req.body;
    const photoPath = req.file.path;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        data: { user: existingUser },
        success: true,
        error: "User already exists with this email",
      });
    }

    const newUser = await User.create({ email, pass: md5(pass), photoPath });

    res.status(201).json({
      data: { user: newUser },
      success: true,
      message: "User signed up successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/api/auth", async (req, res) => {
  try {
    let token;
    const authHeader = req.headers["authorization"];
    if (authHeader !== undefined) {
      token = authHeader.split(" ")[1];
    }

    if (token) {
      const { id } = jwt.verify(token, "qwertyuiop");
      try {
        const user = await User.findOne({ _id: id });
        res.status(200).json({ success: true, data: { user } });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    } else res.json({ success: false, error: "error" });
  } catch (error) {
    console.error(error);
  }
});

const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/faceauth");
    await loadModels();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
