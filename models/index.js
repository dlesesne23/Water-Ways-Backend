// Load environment variables from .env file
require("dotenv").config()
// Import mongoose to interact with MongoDB
const mongoose = require("mongoose")
// Retrieve MongoDB connection URI from environment variables
mongoose.connect(process.env.MONGODBURI);
const db = mongoose.connection

// Event listener for successful connection to MongoDB
db.on("connected", function() {
    console.log(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`)
})

module.exports = {
    User: require("./User"),
    Driver: require("./Driver"),
    Ride: require("./Ride"),
}