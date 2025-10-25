const jwt = require("jsonwebtoken");

const issueToken = async (req, res) => {
  const userData = req.body;
  const token = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });

  res.send({ token });
};

module.exports = {
  issueToken
};