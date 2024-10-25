require('dotenv').config();
const express = require('express');
const path = require('path');
const PORT = process.env.PORT
const app = express();
const db = require('./config/db');
const cors = require('cors');
let Corsoption = {
    origin: ['http://localhost:3000','*']
};
app.use(cors(Corsoption));
db();
const router = require('./routes/web');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

router(app);
app.listen(PORT, (req, res) => {
    console.log(`Server is running on port ${PORT}`);
});