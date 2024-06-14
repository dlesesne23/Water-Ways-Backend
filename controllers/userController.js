require('dotenv').config();
const router = require('express').Router();
// Axios takes the response from external API and stores data it in 
// const axios = require("axios")
// Database models
const db = require('../models');
// For hashing passwords
const bcrypt = require('bcrypt');
// For creating and verifying JSON Web Tokens (JWT)
const jwt = require('jsonwebtoken');


// SIGNUP
router.post('/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      // Check if user already exists
      const existingUser = await db.User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ msg: `Username ${username} already exists. Please sign in.`});
      }
      // Create a new user with the hashed password
      const newUser = new db.User({
        username: username,
        email: email,
        password: password,
      });
      // Save the new user
      await newUser.save();
      user = newUser
      // Create a token for the new user
      const token = createToken(newUser);
      res.json({ token, user: newUser });
    } catch (error) {
      console.log("Signup Error:", error.message)
      res.status(400).json({ msg: error.message });
    }
  });

  // SIGNIN
// Receive credentials from user
// Verify credentials are accurate
// If credentials are accurate, then return a token

router.post('/signin', async (req, res) => {
    try {
      console.log("Attempting to sign in with:", req.body); 
      const { username, password } = req.body
      const foundUser = await db.User.findOne({ username })
      if (!foundUser) throw new Error(`No user found with username ${username}`)
      const validPassword = await bcrypt.compare(password, foundUser.password)
      if (!validPassword) throw new Error(`The password credentials shared did not match the credentials for the user with username ${username}`)
      const token = createToken(foundUser)
    user = foundUser
      res.json({ token, user: foundUser })
    } catch (error) {
      res.status(400).json({ msg: error.message })
    }
  })

  // Create token form
function createToken(user) {
    return jwt.sign({ user }, process.env.SECRETKEY, { expiresIn: '24h' })
  }

// Verify a token
function checkToken(req, res, next) {
    let token = req.get('Authorization')
    if (token) {
      token = token.split(' ')[1]
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        req.user = err ? null : decoded.user
        req.exp = err ? null : new Date(decoded.exp * 1000)
      })
      return next()
    } else {
      req.user = null
      return next()
    }
  }

  function ensureLoggedIn(req, res, next) {
    if (req.user) return next()
    res.status('401').json({ msg: 'Unauthorized You Shall Not Pass' })
  }

  // GET user by id
router.get('/:id', async (req, res) => {
    try {
        const user = await db.User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error: error });
    }
  });
  
  // DELETE user by id
  router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await db.User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Successfully deleted user" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // UPDATE user by id
  router.put('/:id', async (req, res) => {
    // Destructure and remove password from request body if empty
    let { password, ...updateData } = req.body;
    if (password === '') {
      password = undefined; // Ignore password update if field is left empty
    } else {
      // Only hash password if it's updated
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      updateData.password = password;
    }
    
    const updatedUser = await db.User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password -__v');
  
    const token = createToken(updatedUser);
    res.status(200).json({ token, user: updatedUser });
  });

  module.exports = router;