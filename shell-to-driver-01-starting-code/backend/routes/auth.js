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

  // 1) get user's email and password (not hashed)
  const email = req.body.email;
  const pw = req.body.password;

  console.log(`\nLog-in attempt: ${email}\n`);

  // 2) use email to find user's document
  dbConnection.getDbConnection().db().collection('users').findOne({
    email: email
  }).then(userDoc => {

      console.log(`\nUser with email: ${email} found in database! Verifying user's password now ...\n\n`);

      // 3) Check if user login is valid by using bcrypt.compare(plainPassword, hashedPassword) to validate plain password from user with the hashed password from database
      return bcrypt.compare(pw, userDoc.password);
      // bcrypt.compare() will return true if validation is successful

      // ref for using bcrypt.compare as Promise in .then/.catch blocks:  https://www.npmjs.com/package/bcrypt#with-promises
    }

  ).then(verificationResult => {
      // 4) varify the login process with the result of bcrypt.compare

      if (!verificationResult) { // when result is false, throw an error
        console.log(`\nPassword not match!\n`);

        throw Error();
      }
      // if not false (which is true), send a token to user

      console.log(`\nUser: ${email} log in successful! \n`);

      const token = createToken();
      res.status(200).json({
        message: 'Authentication succeeded.',
        token: token
      });
    }

    // 5) if any error happens, catch it and send 401 HTTP response and fail message
  ).catch(err => //
    {
      console.log(`\nUser's log-in attempt has failed!! The error message is:\n`);
      console.log(err);

      res
        .status(401)
        .json({
          message: 'Authentication failed, invalid username or password.'
        });
    }
  );

  //end of router.post('/login', (req, res, next) => {
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
