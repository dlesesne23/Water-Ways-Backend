const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  license: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  isAvailable: { type: Boolean, default: true },
});

driverSchema.index({ location: '2dsphere' });

driverSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id: this._id, name: this.name}, process.env.JWT_SECRETKEY)
    return token
}

driverSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    return next()
})

module.exports = mongoose.model('Driver', driverSchema);