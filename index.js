const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// connection step with mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET_PASSWORD}@cluster0.vrsqm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('electronic_tools_manufacturing').collection('products');
        const bookingCollection = client.db('electronic_tools_manufacturing').collection('booking');

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