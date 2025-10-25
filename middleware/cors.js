const cors = require("cors");

const corsOptions = {
  origin: "*", // You can specify specific origins in production
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = cors(corsOptions);