const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
      },
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret){
            delete ret.password;  
            return ret;
        }
    }
});

userSchema.index({ location: '2dsphere' });

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id: this._id, name: this.name}, process.env.JWT_SECRETKEY)
    return token
}

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    return next()
})

module.exports = mongoose.model('User', userSchema)