const express = require('express');
const axios = require('axios');
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
// Define month mapping
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
    // console.log('Test route params:', req.params);
    const month = req.params.month
    if (!monthMapping[month]) {
        return res.status(400).json({ message: "Invalid month provided!" })
    }
    try {
        // 
        // mongodb aggregate method:
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
// Get statistics for a selected month
router.get('/transactions/statistics', async (req, res) => {
    const month = req.query.month;

    if (!month) {
        return res.status(400).json({ message: "Month is required!" });
    }

    const monthNumber = monthMapping[month];
    if (!monthNumber) {
        return res.status(400).json({ message: "Invalid month provided!" });
    }

    try {
        const products = await Product.find({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] }
        });
        // calculate statistics
        const totalSalesAmount = products.reduce((sum, product) => sum + product.price, 0);
        const totalSoldItems = products.length;
        const totalNotSoldItems = products.filter(product => !product.sold).length;
        res.json({
            totalSalesAmount,
            totalSoldItems,
            totalNotSoldItems
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get bar chart data for a selected month
router.get('/transactions/barchart', async (req, res) => {
    const month = req.query.month;

    if (!month) {
        return res.status(400).json({ message: "Month is required!" });
    }

    const monthNumber = monthMapping[month];
    if (!monthNumber) {
        return res.status(400).json({ message: "Invalid month provided!" });
    }

    try {
        // mongodb  barchart using aggregate fxn
        const products = await Product.aggregate([
            {
                $addFields: {
                    month: { $month: "$dateOfSale" }
                }
            },
            {
                $match: {
                    month: monthNumber
                }
            },
            {
                $bucket: {
                    groupBy: "$price",
                    boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901],
                    default: "Other",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get pie chart data for a selected month
router.get('/transactions/piechart', async (req, res) => {
    const month = req.query.month;

    if (!month) {
        return res.status(400).json({ message: "Month is required!" });
    }

    const monthNumber = monthMapping[month];
    if (!monthNumber) {
        return res.status(400).json({ message: "Invalid month provided!" });
    }

    try {
        const products = await Product.find({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] }
        });

        // Create a map to store category counts
        const categoryCounts = {};

        // Count items in each category
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!categoryCounts[category]) {
                categoryCounts[category] = 0;
            }
            categoryCounts[category] += 1;
        });

        // Convert the map to an array of objects
        const pieChartData = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count
        }));

        res.json(pieChartData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Combined API endpoint
router.get('/combined-data', async (req, res) => {
    const month = req.query.month;

    if (!month) {
        return res.status(400).json({ message: "Month is required!" });
    }

    const monthNumber = monthMapping[month];
    if (!monthNumber) {
        return res.status(400).json({ message: "Invalid month provided!" });
    }

    try {
        // Fetch statistics data
        const statisticsResponse = await axios.get(`http://localhost:3000/api/transactions/statistics?month=${month}`);
        const statistics = statisticsResponse.data;

        // Fetch bar chart data
        const barChartResponse = await axios.get(`http://localhost:3000/api/transactions/barchart?month=${month}`);
        const barChart = barChartResponse.data;

        // Fetch pie chart data
        const pieChartResponse = await axios.get(`http://localhost:3000/api/transactions/piechart?month=${month}`);
        const pieChart = pieChartResponse.data;

        // Combine all data
        const combinedData = {
            statistics,
            barChart,
            pieChart
        };

        res.json(combinedData);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;
