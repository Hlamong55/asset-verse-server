const express = require('express')
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const employeeAffiCollection = db.collection("employeeAffiliations");
    const assetsCollection = db.collection("assets");
    const requestsCollection = db.collection("requests");
    const assignedAssetsCollection = db.collection("assignedAssets");
    const packageCollection = db.collection("packages");




    // hr token verify
    const verifyHR = async (req, res, next) => {
    const email = req.decoded.email;

    const user = await usersCollection.findOne({ email });
    if (user?.role !== "hr") {
    return res.status(403).send({ message: "Forbidden" });
    }
    next();
    };


    // jwt related api
    app.post("/jwt", (req, res) => {
    const user = req.body; //
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "3d"});
    res.send({ token });
    });





    // 1. user related api
    app.post("/users", async (req, res) => {
    const user = req.body;
    const existingUser = await usersCollection.findOne({
    email: user.email,
    });

    if (existingUser) {
    return res.send({ message: "User already exists" });
    }
    const result = await usersCollection.insertOne(user);
    res.send(result);
    });


    app.get("/users/:email", verifyToken, async (req, res) => {
    const email = req.params.email;

    if (email !== req.decoded.email) {
    return res.status(403).send({ message: "Forbidden access" });
    }
    const user = await usersCollection.findOne({ email });
    res.send(user);
    });


    app.patch("/users/:email", verifyToken, async (req, res) => {
    if (req.params.email !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden" });
    }
     result = await usersCollection.updateOne(
        { email: req.params.email },
        { $set: req.body }
    );
    res.send(result);
    });






    // 2. employee affiliation api
    app.get("/employee-affiliations/:email", verifyToken, async (req, res) => {
    const email = req.params.email;

    if (email !== req.decoded.email) {
    return res.status(403).send({ message: "Forbidden" });
    }
    const affiliations = await employeeAffiCollection.find({ employeeEmail: email, status: "active" }).toArray();

    res.send(affiliations);
    });


    app.get("/my-team", verifyToken, async (req, res) => {
    const { companyName } = req.query;

    if (!companyName) {
    return res.status(400).send({ message: "Company required" });
    }

    const affiliations = await employeeAffiCollection.find({ companyName, status: "active" }).toArray();

    const emails = affiliations.map(a => a.employeeEmail);

    const team = await usersCollection.find({ email: { $in: emails } }).project({ name: 1, email: 1, profileImage: 1 }).toArray();

    res.send(team);
    });





    // 3. assets related api
    app.get("/assets", verifyToken, verifyHR, async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const query = { hrEmail: req.decoded.email };

    const assets = await assetsCollection.find(query).skip(skip).limit(limit).sort({ dateAdded: -1 }).toArray();
    total = await assetsCollection.countDocuments(query);

    res.send({ assets, total });
    });


    app.post("/assets", verifyToken, verifyHR, async (req, res) => {
    const hr = await usersCollection.findOne({ email: req.decoded.email });

    const asset = {
    productName: req.body.productName,
    productImage: req.body.productImage,
    productType: req.body.productType,
    productQuantity: Number(req.body.productQuantity),
    availableQuantity: Number(req.body.productQuantity),
    dateAdded: new Date(),
    hrEmail: req.decoded.email,
    companyName: hr.companyName,
    };
    const result = await assetsCollection.insertOne(asset);
    res.send(result);
    });


    app.patch("/assets/:id", verifyToken, verifyHR, async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const { _id, ...updateData } = req.body;

    const result = await assetsCollection.updateOne( query, { $set: updateData });
    res.send(result);
    });


    app.get("/available-assets", verifyToken, async (req, res) => {
    const assets = await assetsCollection.find({ availableQuantity: { $gt: 0 } }).toArray();
    res.send(assets);
    });


    app.delete("/assets/:id", verifyToken, verifyHR, async (req, res) => {
    const id = req.params.id;
    const result = await assetsCollection.deleteOne({ _id: new ObjectId(id),
    });
    res.send(result);
    });







    // 4. request related api
    app.post("/requests", verifyToken, async (req, res) => {
    const email = req.decoded.email;

    const request = {
        assetId: new ObjectId(req.body.assetId),
        assetName: req.body.assetName,
        assetType: req.body.assetType,
        requesterName: req.body.requesterName,
        requesterEmail: email,
        hrEmail: req.body.hrEmail,
        companyName: req.body.companyName,
        requestDate: new Date(),
        approvalDate: null,
        requestStatus: "pending",
        note: req.body.note || "",
    };
    const result = await requestsCollection.insertOne(request);
    res.send(result);
    });


    app.get("/requests", verifyToken, verifyHR, async (req, res) => {
    const result = await requestsCollection.find({ hrEmail: req.decoded.email }).sort({ requestDate: -1 }).toArray();

    res.send(result);
    });


    app.patch("/requests/approve/:id", verifyToken, verifyHR, async (req, res) => {
    try {
    const requestId = req.params.id;

    const request = await requestsCollection.findOne({
      _id: new ObjectId(requestId),
    });

    if (!request) {
      return res.status(404).send({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).send({ message: "Request already processed" });
    }

    // find asset
    const asset = await assetsCollection.findOne({
      _id: new ObjectId(request.assetId),
    });

    if (!asset || asset.availableQuantity <= 0) {
      return res.status(400).send({ message: "Asset not available" });
    }

    // decrease asset quantity
    await assetsCollection.updateOne(
      { _id: asset._id },
      { $inc: { availableQuantity: -1 } }
    );

    // update request status
    await requestsCollection.updateOne(
      { _id: request._id },
      {
        $set: {
          status: "approved",
          approvedAt: new Date(),
        },
      }
    );

    // add asset to employee
    await usersCollection.updateOne(
      { email: request.employeeEmail },
      {
        $push: {
          assets: {
            assetId: asset._id,
            productName: asset.productName,
            assignedAt: new Date(),
          },
        },
      }
    );

    // check affiliation
    const existingAffiliation = await employeeAffiCollection.findOne({
      employeeEmail: request.employeeEmail,
      companyName: asset.companyName,
    });

    if (!existingAffiliation) {
      await employeeAffiCollection.insertOne({
        employeeEmail: request.employeeEmail,
        companyName: asset.companyName,
        companyLogo: asset.companyLogo || "",
        affiliationDate: new Date(),
      });
    }

    res.send({ message: "Request approved successfully" });
    } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Approve failed" });
    }
    });


    app.patch("/requests/reject/:id", verifyToken, verifyHR, async (req, res) => {
    try {
    const requestId = req.params.id;

    const request = await requestsCollection.findOne({
      _id: new ObjectId(requestId),
    });

    if (!request) {
      return res.status(404).send({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).send({ message: "Request already processed" });
    }

    await requestsCollection.updateOne(
      { _id: request._id },
      {
        $set: {
          status: "rejected",
          rejectedAt: new Date(),
        },
      }
    );

    res.send({ message: "Request rejected successfully" });
    } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Reject failed" });
    }
    });








    // 5. assigned assets api
    app.get("/assigned-assets", verifyToken, async (req, res) => {
    const email = req.decoded.email;

    const result = await assignedAssetsCollection.find({ employeeEmail: email }).sort({ assignmentDate:-1 }).toArray();
    res.send(result);
    });






    // 6. package related api
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
