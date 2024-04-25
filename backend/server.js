const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { Canvas, Image, ImageData } = require('canvas');
const faceapi = require('face-api.js');
const User = require('./models/Users');
var cors = require('cors')
var path = require('path')
const fs = require('fs')
var jwt = require('jsonwebtoken');
var md5 = require('md5');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors())

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({
  minConfidence: 0.5, // Minimum confidence threshold
  // Add other options as needed
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Uploads will be stored in 'uploads' directory
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('modelss');
  await faceapi.nets.faceLandmark68Net.loadFromDisk('modelss');
  await faceapi.nets.faceRecognitionNet.loadFromDisk('modelss');
}


app.post('/api/login', upload.single('photo'), async (req, res) => {
  try {
    const { email, pass } = req.body;
    const image = req.body.photo;
    const imageName = `login.jpg`;
    const imagePath = `./uploads/temp/${imageName}`;
    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    fs.writeFile(imagePath, imageBuffer, (err) => {
      if (err) {
        console.error('Error saving image:', err);
        throw new Error('Failed to save image');
      }
      console.log('Image saved:', imageName);
    });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    } else if (user.pass !== md5(pass)) {
      return res.status(201).json({ success: false, error: 'Wrong Credentials' });
    }
    const userImagePath = user.photoPath;

    const uploadedImage = new Image();
    uploadedImage.src = imagePath;
    const canvas1 = new Canvas(uploadedImage.width, uploadedImage.height);
    const ctx1 = canvas1.getContext('2d');
    ctx1.drawImage(uploadedImage, 0, 0, uploadedImage.width, uploadedImage.height);

    const userPhoto = new Image();
    userPhoto.src = userImagePath;
    const canvas2 = new Canvas(userPhoto.width, userPhoto.height);
    const ctx2 = canvas2.getContext('2d');
    ctx2.drawImage(userPhoto, 0, 0, userPhoto.width, userPhoto.height);

    console.log("Image paths:", userImagePath, imagePath);
    console.log("Loaded images:", uploadedImage, userPhoto);


    const upFace = await faceapi.detectSingleFace(canvas1, faceDetectionOptions.faceDetectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const savFace = await faceapi.detectSingleFace(canvas2, faceDetectionOptions.faceDetectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();


    const faceMatcher = new faceapi.FaceMatcher(savFace)

    const bestMatch = faceMatcher.findBestMatch(upFace.descriptor)
    console.log("Best matches:", bestMatch);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('File is deleted.');
      }
    });
    const token = jwt.sign({ id: user._id }, 'qwertyuiop', { expiresIn: '24h' });

    res.status(200).json({ success: true, data: { matches: bestMatch, user, token } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/signup', upload.single('photo'), async (req, res) => {
  try {
    const { email, pass } = req.body;
    const photoPath = req.file.path;
    //console.log(1, req.body, photoPath);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(201).json({ data: { user: existingUser }, success: true, error: 'User already exists with this email' });
    }

    const newUser = new User({ email, pass: md5(pass), photoPath });

    await newUser.save();

    res.status(201).json({ data: { user: newUser }, success: true, message: 'User signed up successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/auth', async (req, res) => {
  let token;
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    token = authHeader.split(" ")[1];
  }

  try {
    if (token) {
      const { id } = jwt.verify(token, 'qwertyuiop');
      //console.log(id)
      try {
        const user = await User.findOne({ _id: id });
        res.status(200).json({ success: true, data: { user } });

      } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    } else res.json({ success: false, error: 'error' });
  } catch (error) {
    //res.json({ success: false, error: 'Server error' });
    console.error(error);
  }

});

const start = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/faceauth');
    await loadModels(); // Load face-api.js models
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

start();
