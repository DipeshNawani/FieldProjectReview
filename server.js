const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const serviceAccount = require("./firebaseServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify Firebase ID Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Sample protected route
app.get("/api/users/profile", verifyToken, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name || "Firebase User"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
