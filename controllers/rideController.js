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

// Request a ride
router.post('/request', async (req, res) => {
  try {
    const { userId, pickupLocation, dropoffLocation } = req.body;
    const ride = new Ride({
      user: userId,
      pickupLocation: { type: 'Point', coordinates: pickupLocation },
      dropoffLocation: { type: 'Point', coordinates: dropoffLocation },
    });
    await ride.save();
    
    // Notify nearby drivers
    // (Logic to find and notify nearby drivers)

    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a ride
router.post('/accept/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    ride.driver = driverId;
    ride.status = 'accepted';
    await ride.save();

    driver.isAvailable = false;
    await driver.save();

    // Notify user that their ride has been accepted
    // (Socket.io logic)

    res.status(200).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete a ride
router.post('/complete/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    ride.status = 'completed';
    await ride.save();

    const driver = await Driver.findById(ride.driver);
    driver.isAvailable = true;
    await driver.save();

    res.status(200).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;