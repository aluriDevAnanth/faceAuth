# FaceAuth

FaceAuth is a facial recognition-based authentication system. It uses machine learning models for face detection, recognition, and other related tasks. The project is divided into a **frontend** built with React and a **backend** powered by Node.js and Express.

## Features

- **User Authentication**: Login and signup using facial recognition and email/password.
- **Face Detection**: Detects faces using pre-trained models.
- **Face Recognition**: Matches user-uploaded photos with stored user data.
- **Responsive Frontend**: Built with React and Bootstrap for a modern UI.
- **REST API**: Backend provides endpoints for authentication and user management.

## Project Structure

```sh
./
    .gitignore
    file_list.txt
    folder_structure1.txt
    package.json
    README.md
    tree.py
    tree.txt
    .vscode/
        launch.json
        tasks.json
    backend/
        .gitignore
        package-lock.json
        package.json
        server.js
        models/
            Users.js
        modelss/
            age_gender_model-shard1
            age_gender_model-weights_manifest.json
            face_expression_model-shard1
            face_expression_model-weights_manifest.json
            face_landmark_68_model-shard1
            face_landmark_68_model-weights_manifest.json
            face_landmark_68_tiny_model-shard1
            face_landmark_68_tiny_model-weights_manifest.json
            face_recognition_model-shard1
            face_recognition_model-shard2
            face_recognition_model-weights_manifest.json
            mtcnn_model-shard1
            mtcnn_model-weights_manifest.json
            ssd_mobilenetv1_model-shard1
            ssd_mobilenetv1_model-shard2
            ssd_mobilenetv1_model-weights_manifest.json
            tiny_face_detector_model-shard1
            tiny_face_detector_model-weights_manifest.json
    frontend/
        .eslintrc.cjs
        .gitignore
        index.html
        package-lock.json
        package.json
        README.md
        vite.config.js
        public/
        src/
            App.jsx
            main.jsx
            context/
                AuthPro.jsx
            pages/
                Home.jsx
                Login.jsx
                Settings.jsx
                components/
                    Header.jsx

```

## Installation

### Prerequisites

- Node.js (v16 or later)
- MongoDB (running locally or remotely)

### Backend Setup

1. Navigate to the **`backend`** folder:

   ```sh
   cd backend
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the backend server:

   ```sh
   npm run dev
   ```

### Frontend Setup

1. Navigate to the **`frontend`** folder:

   ```sh
   cd frontend
   ```

2. Install dependencies:

   ```sh
   cd install
   ```

3. Start the backend server:

   ```sh
   npm run dev
   ```

## Usage

1. Open the frontend in your browser (default: http://localhost:5173).
2. Sign up by providing your email, password, and a photo.
3. Log in using your email, password, and a live photo taken via webcam.

## API Endpoints

- **POST /api/signup**: Register a new user.
- **POST /api/login**: Authenticate a user using facial recognition.
- **GET /api/auth**: Fetch authenticated user details.

## Models

The backend uses pre-trained models stored in the backend/modelss directory. These include:

- **ssd_mobilenetv1_model**: For face detection.
- **face_landmark_68_model**: For facial landmark detection.
- **face_recognition_model**: For face recognition.
- **age_gender_model**: For age and gender prediction.
- **face_expression_model**: For facial expression analysis.

## Dependencies

### Backend

- **express**: Web framework for Node.js.
- **mongoose**: MongoDB object modeling.
- **face-api.js**: Facial recognition library.
- **multer**: File upload middleware.
- **jsonwebtoken**: Token-based authentication.

### Frontend

- **react**: Frontend library.
- **react-router-dom**: Routing for React.
- **formik & yup**: Form handling and validation.
- **react-webcam**: Webcam integration.
- **bootstrap**: UI framework.
