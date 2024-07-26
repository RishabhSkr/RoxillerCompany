const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('../db/db');
const router = express.Router();

const url = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

router.get('/initialize', async (req, res) => {
  try {
    const response = await axios.get(url);
    const products = response.data;
    console.log(products)
    // Clear the existing products and insert new ones
    await Product.deleteMany({});
    await Product.insertMany(products);

    res.status(200).send('Database initialized with seed data');
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('An error occurred: ' + error.message);
  }
});
module.exports = router;
