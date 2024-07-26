require('dotenv').config();
const router = require('./routes/routes');
const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3000;
mongoose.connect(mongoString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

const app = express();
app.use('/api', router)
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server Started at ${3000}`)
})


