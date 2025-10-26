const { getCollections } = require("../config/database");

const verifyAdmin = async (req, res, next) => {
  try {
    const { users } = getCollections();
    const userEmail = req.decoded.email;
    
    const user = await users.findOne({ email: userEmail });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).send({ message: "Forbidden: Admin access required" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).send({ message: "Server error during admin verification" });
  }
};

module.exports = verifyAdmin;