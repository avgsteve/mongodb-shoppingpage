/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Router = require('express').Router;
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const dbConnection = require('../db'); // replace const mongodb to get connection and access to DB
const Decimal128 = mongodb.Decimal128;
const ObjectId = mongodb.ObjectId; // to create a ObjectId instance for making a new and unique id for new document // ref: https://mongodb.github.io/node-mongodb-native/3.6/api/ObjectID.html

const router = Router();

const products = [{
    _id: 'fasdlk1j',
    name: 'Stylish Backpack',
    description: 'A stylish backpack for the modern women or men. It easily fits all your stuff.',
    price: 79.99,
    image: 'http://localhost:3100/images/product-backpack.jpg'
  },
  {
    _id: 'asdgfs1',
    name: 'Lovely Earrings',
    description: "How could a man resist these lovely earrings? Right - he couldn't.",
    price: 129.59,
    image: 'http://localhost:3100/images/product-earrings.jpg'
  },
  {
    _id: 'askjll13',
    name: 'Working MacBook',
    description: 'Yes, you got that right - this MacBook has the old, working keyboard. Time to get it!',
    price: 1799,
    image: 'http://localhost:3100/images/product-macbook.jpg'
  },
  {
    _id: 'sfhjk1lj21',
    name: 'Red Purse',
    description: 'A red purse. What is special about? It is red!',
    price: 159.89,
    image: 'http://localhost:3100/images/product-purse.jpg'
  },
  {
    _id: 'lkljlkk11',
    name: 'A T-Shirt',
    description: 'Never be naked again! This T-Shirt can soon be yours. If you find that buy button.',
    price: 39.99,
    image: 'http://localhost:3100/images/product-shirt.jpg'
  },
  {
    _id: 'sajlfjal11',
    name: 'Cheap Watch',
    description: 'It actually is not cheap. But a watch!',
    price: 299.99,
    image: 'http://localhost:3100/images/product-watch.jpg'
  }
];

// Get list of ALL products from database "shop"
router.get('/', (req, res, next) => {
  // Return a list of dummy products
  // Later, this data will be fetched from MongoDB

  // const queryPage = req.query.page;
  // const pageSize = 5;
  // let resultProducts = [...products];
  // if (queryPage) {
  //   resultProducts = products.slice(
  //     (queryPage - 1) * pageSize,
  //     queryPage * pageSize
  //   );
  // }

  console.log('\n=== (from products.js) Entering page for all products: ===\n');

  const products = [];

  dbConnection.getDbConnection() // establish connection like using mongo shell to execute "db.collection.find() command"

    // Originally, use the code below as Promise ... then block to get the connection and use it to perform query task

    /*  MongoClient.connect(
          'mongodb+srv://stevedev:test1234@project-guest-house.kagvr.gcp.mongodb.net/shop?retryWrites=true&w=majority'
        )
        .then(client =>
        .db().collection('products').find() ...

    */

    .db()
    .collection('products')
    .find() // will generate a "cursor" object
    .forEach(productDoc => {
      // Use .forEach method on the cursor object that handles all the operations on query result using find()
      // ref: https://docs.mongodb.com/manual/reference/method/cursor.forEach/#cursor.forEach
      //add .price property to each productDoc (Obj from Cursor)
      productDoc.price = productDoc.price.toString();
      //Push each data (document) products array
      products.push(productDoc);
    })
    .then(result => {

      console.log('\nThe product data from MongoDB :\n');
      console.log(products);

      console.log('\nThe result of find() method in database:\n');
      console.log(result);

      // client.close(); //

      //send HTTP response to browser
      res.status(200)
        // ## send products Array as data base to front-end
        .json(products);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'An error occurred.'
      });
    });
});


// Get single product
router.get('/:id', (req, res, next) => {
  //the "id" will be the value in "req.params.id"

  // const product = products.find(p => p._id === req.params.id);
  dbConnection.getDbConnection()
    .db()
    .collection('products')
    .findOne({
      _id: new ObjectId(req.params.id) //need to use ObjectId() object with passed-in id to make a query
    }).then(

      //get the (single) document
      productDoc => {
        console.log(`\nThe document from database:\n`);
        console.log(productDoc);
        console.log("\n\n");

        productDoc.price = productDoc.price.toString(); //need to convert the number to string to String as React.js sees numberDecimal number an invalid data(number) type
        /* The data of price field saved in MongoDB
                price:
          Decimal128 {
            _bsontype: 'Decimal128',
            bytes: <Buffer a4 08 00 00 00 00 00 00 00 00 00 00 00 00 3c 30> },
        */
        res.status(200).json(productDoc);
      }

    ).catch(error => {
      console.log("\n(from products.js) There's an error occurred in router.get('/:id') !:\n");
      console.log(error);
      console.log("\n\n");

      res.status(500).json({
        message: `An error occurred in router.get('/:id').`
      });
    });

});


// Add new product
// Requires logged in user
router.post('', (req, res, next) => {
  const newProduct = {
    name: req.body.name,
    description: req.body.description,
    price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
    image: req.body.image
  };


  MongoClient.connect(
      'mongodb+srv://stevedev:test1234@project-guest-house.kagvr.gcp.mongodb.net/shop?retryWrites=true&w=majority'
    )
    .then(client => {
      // MongoClient will return a Promise with MongoDB's response after adding document to collection
      client
        .db()
        .collection('products')
        .insertOne(newProduct) //equals to db.products.insertOne(document) in mongo shell
        .then(result => {

          console.log('\nThe result of newly added document in database:\n');
          console.log(result);

          client.close();

          //send HTTP response to browser
          res
            .status(201)
            .json({
              message: 'Product added',
              // .insertedId is the ObjectId in MongoDB's document
              productId: result.insertedId
            });
        })
        .catch(err => {
          console.log(err);
          client.close();
          res.status(500).json({
            message: 'An error occurred.'
          });
        });
    }) //
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'An error occurred.'
      });
    });
});

// Edit existing product
// Requires logged in user
router.patch('/:id', (req, res, next) => {
  const updatedProduct = {
    name: req.body.name,
    description: req.body.description,
    price: parseFloat(req.body.price), // store this as 128bit decimal in MongoDB
    image: req.body.image
  };
  console.log(updatedProduct);
  res.status(200).json({
    message: 'Product updated',
    productId: 'DUMMY'
  });
});

// Delete a product
// Requires logged in user
router.delete('/:id', (req, res, next) => {
  res.status(200).json({
    message: 'Product deleted'
  });
});

module.exports = router;
