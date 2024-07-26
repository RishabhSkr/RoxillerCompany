const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold : Boolean,
  dateOfSale: Date
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

    // id: 60,
    // title: 'DANVOUY Womens T Shirt Casual Cotton Short',
    // price: 412.99,
    // description: '95Cotton5Spandex Features Casual Short Sleeve Letter PrintVNeckFashion Tees The fabric is soft and has some stretch. Occasion CasualOfficeBeachSchoolHomeStreet. Season SpringSummerAutumnWinter.',
    // category: "women's clothing",
    // image: 'https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg',
    // sold: true,
    // dateOfSale: '2021-09-27T20:29:54+05:30'