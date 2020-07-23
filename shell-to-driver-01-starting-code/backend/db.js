/*jshint esversion: 6 */
/*jshint esversion: 8 */
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient; // use MongoClient constructor function get connection and access to DB

//ref:  https://www.udemy.com/course/mongodb-the-complete-developers-guide/learn/lecture/11861320#questions/10548446


const mongoDbUrl =
  'mongodb+srv://stevedev:test1234@project-guest-house.kagvr.gcp.mongodb.net/shop?retryWrites=true&w=majority'; // It's the URL as argument for function MongoClient.connect(uri) to establish connection to database

let databaseConnection; // databaseConnection was originally "_db" in tutorial
// To be used to check if the connection has been successfully established


// Establish connection to database and send result of connection to callback function
const initialDbConnection = callback => {
  // ex: (err, databaseConnection) => { ... } (then run server if no error)

  console.log("\n(from db.js, initialDbConnection() function:)\n\nInitailizing connection to MongoDB ...\n\n");

  // (For error-prove purpose:)
  // 1) Check if the databaseConnection (database) is already initialzed
  if (databaseConnection) {

    console.log('\nDatabase was initialized already!\n');
    //return the callback function with null so it can deal with error that caused by the initialization
    return callback(null, databaseConnection);
  }

  // 2) Connect to MongoDB server and get connection results (successed or failed)
  MongoClient.connect(mongoDbUrl)

    // a) If successfully connect to DB
    .then(connectionEstablished => {

      console.log('\n(from db.js) Database connection initialized!\n');

      databaseConnection = connectionEstablished; //assign the connection status to variable databaseConnection
      callback(null, databaseConnection); // Send databaseConnection to callback function and use "null" as argument to callback function to start local server (in app.js) because means "No error occurred"
    })

    // If FAIL to connect to DB
    .catch(err => {
      callback(err); //send err message to callback function and log out the error message in console
    });

  // ref for MongoClient.connect:
  // https://mongodb.github.io/node-mongodb-native/api-generated/mongoclient.html#connect
};


const getDbConnection = () => {
  if (!databaseConnection) {
    throw Error('Database not initialzed');
  }
  return databaseConnection;
};

module.exports = {
  initialDbConnection, //used in app.js to start backend service
  getDbConnection //used in product.js to establish connection for getting product data from MongoDB database (from the database: "shop")
};
