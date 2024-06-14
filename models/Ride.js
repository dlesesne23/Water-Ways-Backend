const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  pickupLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  dropoffLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  status: { type: String, enum: ['pending', 'accepted', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ride', rideSchema);