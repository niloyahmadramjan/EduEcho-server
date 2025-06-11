const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = process.env.PORT || 3000;

// Midleware
app.use(express.json());
app.use(cors());

// MongoDB connection

const uri =process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const articlesCollection = client.db("eduecho").collection("allArticles");
    const userCollection = client.db("eduecho").collection("userInfo");

    app.get("/articles", async (req, res) => {
      const articles = await articlesCollection.find().toArray();
      res.send(articles);
    });

    //user info collect 
    app.post("/userinfo",async (req,res)=>{
        const userInfo = req.body;
        const checkExistingData = await userCollection.findOne({email : userInfo.email});
        if(checkExistingData){
          return res.status(200).send({message : "user already exists"})
        }
        const result = await userCollection.insertOne(userInfo);
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`EduEcho server is running on ${port}`);
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
