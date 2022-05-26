const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// connection step with mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET_PASSWORD}@cluster0.vrsqm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// verify jwt token function 
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('electronic_tools_manufacturing').collection('products');
        const bookingCollection = client.db('electronic_tools_manufacturing').collection('booking');
        const userCollection = client.db('electronic_tools_manufacturing').collection('users');
        const reviewCollection = client.db('electronic_tools_manufacturing').collection('reviews');
        const profileCollection = client.db('electronic_tools_manufacturing').collection('profiles');
        const addProductCollection = client.db('electronic_tools_manufacturing').collection('singleProduct');

        // all data load 
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        // load single data 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result)
        })
        // data create
        app.post('/booking', async (req, res) => {
            const doc = req.body;
            const email = req.body;
            const query = { email: email }
            const exists = await bookingCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, email: exists })
            }
            const result = await bookingCollection.insertOne(doc)
            return res.send({ success: true, result });
        })
        // single product data post api
        app.post('/singleProduct', async (req, res) => {
            const doc = req.body;
            const result = await addProductCollection.insertOne(doc);
            res.send(result)
        })
        // data load single
        app.get('/singleProduct', async (req, res) => {
            const result = await addProductCollection.find().toArray();

            res.send(result);
        })

        // booking data load 
        app.get('/booking', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email }
                const bookings = await bookingCollection.find(query).toArray();
                res.send(bookings)
            }
            else {
                return res.status(403).send({ message: 'forbidden access' })
            }

        })
        // data load all users
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;

            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })
        // admin data
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: {
                        role: 'admin'
                    },
                };
                const result = await userCollection.updateOne(filter, updateDoc)

                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

        // user data collection api or add or update
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const user = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '1d' })
            res.send({ result, token });
        })
        // reviews post 
        app.post('/reviews', async (req, res) => {
            const doc = req.body;
            const result = await reviewCollection.insertOne(doc);
            res.send(result);
        })
        // review data load on homepage
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/profiles', async (req, res) => {
            const doc = req.body;
            const result = await profileCollection.insertOne(doc);
            res.send(result)
        })

    }
    finally {

    }

}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('My electronic tools manufacturing is running!!')
})
app.listen(port, () => {
    console.log('app is running', port);
})