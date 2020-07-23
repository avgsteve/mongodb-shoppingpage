/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
// const mongodb = require('mongodb').MongoClient;
const db = require('./db'); // replace const mongodb

const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  // Set CORS headers so that the React SPA is able to communicate with this server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/products', productRoutes);
app.use('/', authRoutes);


// orginal code: app.listen(3100);

// changed to below to make sure the connection to database can be successfully established
// before runnung backend service when the page
// at the endpoint: /products is triggering productRoutes middleware function
db.initialDbConnection((err, databaseConnection) => {

  if (err) {
    console.log(err);

  } else {

    app.listen(3100);

    console.log('\n=== Backend server started after successfully establishing connection to MongoDB! ===\n\nCurrent detail of connection to MongoDB database:\n');
    console.log(databaseConnection);

    console.log('\n===     end of log from app.js after backend server has been started initialzed   ===\n\n');

  }
});
