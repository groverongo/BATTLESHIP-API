import express from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import multer from 'multer'
import mongoose from 'mongoose'
import { userSchema } from './Document.js'

dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/BATTLESHIP');
const User = mongoose.model('user', userSchema)
const upload = multer()

function generateAccessToken(param) {
  return jwt.sign(param, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

const app = express()
const port = 25565

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Send username and password and veify it with the MongoDB database
app.post('/api/login', upload.array(), (req, res) => {
  console.log("POST: /api/login")

  // Find the user with the username as _id
  User.findById(req.body.username).exec().then(user => {

    // If the doc. doesn't exist
    if (user == null) return res.sendStatus(401);

    // If the document exist, send the token with the username encoded
    res.status(200).send({
      token: generateAccessToken({ username: req.body.username })
    });

  });

});

// It's the same as a register, is creates a new account with a random board
app.post('/api/boards', upload.array(), (req, res) => {
  console.log("POST: /api/boards")

  // Create User model instance with the info sent in the request body
  const newUser = new User({
    _id: req.body.username,
    password: req.body.password,
    shipsInfo: req.body.shipsInfo
  });


  // Try to save the instance in the document
  newUser.save().then(
    // If the instance got added succesfully
    () => res.sendStatus(200),
    // If there are errors
    () => res.sendStatus(400)
  );
});

// Obtain the Bearer token from the headers
function obtainJWTToken(req) {
  const authHeader = req.headers.authorization;
  return authHeader && authHeader.split(' ')[1];
}

// It updates the board of the current user, AUTHENTICATION required
app.put('/api/boards', upload.array(), (req, res) => {
  console.log("PUT: /api/boards")
  // Obtain the token
  const token = obtainJWTToken(req);

  // Verify that a token was sent
  if (token == null) return res.sendStatus(401);

  // Decode the JWT with the token provided
  jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
    // If there were problems decoding
    if (err) return res.sendStatus(403);

    // Search by username
    User.findByIdAndUpdate(data.username, { shipsInfo: req.body }).exec();
    res.sendStatus(200);
  })
})

// Obtain your board
app.get('/api/boards', (req, res) => {
  console.log("GET: /api/boards")

  // Obtain token from headers
  const token = obtainJWTToken(req)

  // check token exists
  if (token == null)
    return res.sendStatus(401);

  // decode token
  jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
    // Correct decoding
    if (err)
      return res.sendStatus(403);

    // send the ship info in the response
    User.findById(data.username).exec().then(user => {
      return res.send(user.shipsInfo)
    })
  })
})

app.listen(port, () => {
  console.log(`BATTLESHIP API STARTED ON PORT: ${port}`)
})