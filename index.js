const express = require('express')
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;


// middleware
app.use(express.json());
app.use(cors());


// token verify
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    req.decoded = decoded;
    next();
  });
};


// hr token verify
const verifyHR = async (req, res, next) => {
  const email = req.decoded.email;

  const user = await usersCollection.findOne({ email });
  if (user?.role !== "hr") {
    return res.status(403).send({ message: "Forbidden" });
  }
  next();
};






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster01.quh7cvg.mongodb.net/?appName=Cluster01`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("assetVerse_DB");
    const usersCollection = db.collection("users");
    const packageCollection = db.collection("packages");




    // jwt related api
    app.post("/jwt", (req, res) => {
    const user = req.body; //
    const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "3d",
    });
    res.send({ token });
    });



    // package related api
    app.get("/packages", async (req, res) => {
      const cursor = packageCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/packages", verifyToken, verifyHR, async (req, res) => {
      const package = req.body;
      const result = await packageCollection.insertOne(package);
      res.send(result);
    });





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Asset Verse is cooking something')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
