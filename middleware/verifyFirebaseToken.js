const admin = require('firebase-admin');
const serviceAccount = require('../firebase-adminsdk.json');

// 🔹 Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔹 Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token using Firebase Admin SDK
    const decodedUser = await admin.auth().verifyIdToken(token);
    console.log(decodedUser)
    // Store user info in request
    req.user = decodedUser;

    // Go to next middleware or route
    next();
  } catch (error) {
    console.error('Firebase Token Verification Error:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyFirebaseToken;
