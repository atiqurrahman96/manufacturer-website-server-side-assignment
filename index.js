const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
// connection step with mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET_PASSWORD}@cluster0.vrsqm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });






app.get('/', (req, res) => {
    res.send('My electronic tools manufacturing is running!!')
})
app.listen(port, () => {
    console.log('app is running', port);
})