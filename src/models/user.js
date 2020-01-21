const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,           // Now email must be unique for every user
        required: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error ('Email is invalid')
            }
        }
    },

    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,             // Password Length must be greater than 6
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error ('Password cannot contain "password"')
            }
        }
    },

    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true 
        }
    }],
    avatar: {
        type: Buffer    
    }
},{
    timestamps: true
})




// virtual property -> it is not actual data stored in db , it's a relationship b/w two entities.

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',          
    foreignField: 'owner'           // since there is relation between localField(_id) and foreignField(owner)
})

// userSchema.methods.getPublicProfile = function (){
    userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}


// making user defined schemas so that we can directly use it in router(user.js)
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Login id or password is incorrect')
    }

    return user
}

// Hash the plain text password before saving
// pre for before an event and post for after an event
userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next() //we simply call next when we are done with this function
})

// Delete the tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User