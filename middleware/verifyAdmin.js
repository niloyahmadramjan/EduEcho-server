const { getCollections } = require("../config/database");

const verifyAdmin = async (req, res, next) => {
  try {
    const { users } = getCollections();

    // ✅ Use req.user.email (from verifyFirebaseToken)
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).send({ message: "Unauthorized: No user email found" });
    }

    const user = await users.findOne({ email: userEmail });
    console.log("Admin verification user:", user);

    if (!user || user.role !== "admin") {
      return res.status(403).send({ message: "Forbidden: Admin access required" });
    }

    req.user = user; // ✅ store full DB user for later use
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).send({ message: "Server error during admin verification" });
  }
};

module.exports = verifyAdmin;
