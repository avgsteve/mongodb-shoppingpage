/*jshint esversion: 6 */
/*jshint esversion: 8 */
const Router = require('express').Router;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const dbConnection = require('../db'); // replace const mongodb to get connection and access to DB

const router = Router();

const createToken = () => {
  return jwt.sign({}, 'secret', {
    expiresIn: '1h'
  });
};

router.post('/login', (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;
  // Check if user login is valid
  // If yes, create token and return it to client
  const token = createToken();
  // res.status(200).json({ token: token, user: { email: 'dummy@dummy.com' } });
  res
    .status(401)
    .json({
      message: 'Authentication failed, invalid username or password.'
    });
});

router.post('/signup', (req, res, next) => {

  // 1) get user's email and password from form
  const email = req.body.email;
  const pw = req.body.password;

  // 2) Hash password before storing it in database => Encryption at Rest
  bcrypt
    .hash(pw, 12)
    .then(hashedPW => {


      // 3) Store hashedPW in database
      console.log(`\n(from route: /signup) The hashed passowrd: ${hashedPW}\n`);

      dbConnection.getDbConnection().db().collection('users').insertOne({
          email: email,
          password: hashedPW

        }).then(result => { // when successful
          // log out the result
          console.log(result);
          const token = createToken(); //create token for user
          res.status(201).json({
            message: 'user has successfully signed up ',
            token: token,
            user: {
              email: email
            }
          });
        })

        // the catch block for the try block of collection('users').insertOne()
        // By setting Index of email field as unique, the user is not allowed to use the same (existing) email to sign up (not the best practice to prevent this)
        .catch(err => {
          console.log(err);
          res.status(500).json({
            message: 'Creating the user failed.'
          });
        });

    }) // === the end of the try block of bcrypt.hash() ===
    // the catch block for the try block of bcrypt.hash()
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'Creating the user failed.'
      });
    });


  // Add user to database
});

module.exports = router;
