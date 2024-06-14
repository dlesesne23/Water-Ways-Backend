require('dotenv').config();
const router = require('express').Router();
// Axios takes the response from external API and stores data it in 
// const axios = require("axios")
const Ride = require('../models/Ride'); 
// For hashing passwords
const bcrypt = require('bcrypt');
// For creating and verifying JSON Web Tokens (JWT)
const jwt = require('jsonwebtoken');

// Request a ride
router.post('/request', async (req, res) => {
    try {
        const { userId, pickupLocation, dropoffLocation } = req.body;
        const newRide = new Ride({
          user: userId,
          pickupLocation: {
            type: 'Point',
            coordinates: [pickupLocation.longitude, pickupLocation.latitude],
          },
          dropoffLocation: {
            type: 'Point',
            coordinates: [dropoffLocation.longitude, dropoffLocation.latitude],
          },
          status: 'pending',
        });
    
        await newRide.save();
        res.status(201).send('Ride requested successfully');
      } catch (error) {
        res.status(500).send('Error requesting ride');
        console.error(error);
      }
    })
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
      };


module.exports = router;