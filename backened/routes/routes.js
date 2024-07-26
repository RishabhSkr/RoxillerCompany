const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('../db/db');
const router = express.Router();

const url = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';
// feed the data
router.get('/initialize', async (req, res) => {
    try {
        const response = await axios.get(url);
        const products = response.data;
        // console.log(products)
        // Clear the existing products and insert new ones
        await Product.deleteMany({});
        await Product.insertMany(products);

        res.status(200).send('Database initialized with seed data');
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('An error occurred: ' + error.message);
    }
});

// get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// find all the products that bought in each month
router.get('/products/month/:month', async (req, res) => {
    console.log('Test route params:', req.params);
    const month = req.params.month
    const monthMapping = {
        'January': 1,
        'February': 2,
        'March': 3,
        'April': 4,
        'May': 5,
        'June': 6,
        'July': 7,
        'August': 8,
        'September': 9,
        'October': 10,
        'November': 11,
        'December': 12
    };
    if(!monthMapping[month]){
        return res.status(400).json({message:"Invalid month provided!"})
    }
    try {
        const products = await Product.aggregate([
            {
              $addFields: {
                month: { $month: "$dateOfSale" }
              }
            },
            {
              $match: {
                month: monthMapping[month]
              }
            },
            {
              $project: {
                month: 0 // Hide the month field from the result
              }
            }
          ]);
          res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
// Search and paginate product transactions, with optional month filter
router.get('/transactions', async (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const month = req.query.month;
  
    const query = {};
  
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
  
      // Try to parse search as a number for price matching
      const searchNumber = parseFloat(search);
      if (!isNaN(searchNumber)) {
        query.$or.push({ price: searchNumber });
      }
    }
  
    if (month) {
      const monthMapping = {
        'January': 1,
        'February': 2,
        'March': 3,
        'April': 4,
        'May': 5,
        'June': 6,
        'July': 7,
        'August': 8,
        'September': 9,
        'October': 10,
        'November': 11,
        'December': 12
      };
  
      const monthNumber = monthMapping[month];
      if (!monthNumber) {
        return res.status(400).json({ message: "Invalid month provided!" });
      }
  
      query.$expr = { $eq: [{ $month: "$dateOfSale" }, monthNumber] };
    }
  
    try {
      const totalRecords = await Product.countDocuments(query);
      const products = await Product.find(query)
        .skip((page - 1) * perPage)
        .limit(perPage);
  
      res.json({
        page,
        perPage,
        totalRecords,
        totalPages: Math.ceil(totalRecords / perPage),
        products
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports = router;
