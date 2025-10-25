const { getCollections } = require("../config/database");

const createUser = async (req, res) => {
  try {
    const { users } = getCollections();
    const { uid, name, email, photo } = req.body;

    const existingUser = await users.findOne({ uid });

    if (!existingUser) {
      const result = await users.insertOne({
        uid,
        name,
        email,
        photo,
        createdAt: new Date(),
      });
      res
        .status(201)
        .send({ message: "User created", userId: result.insertedId });
    } else {
      res.status(200).send({ message: "User already exists" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error saving user", error });
  }
};

const getUserByUID = async (req, res) => {
  try {
    const { users } = getCollections();
    const uid = req.params.uid;
    const user = await users.findOne({ uid: uid });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch user" });
  }
};

module.exports = {
  createUser,
  getUserByUID
};