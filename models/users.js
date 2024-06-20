const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true, // Ensure uniqueness of email field
        // Optionally, define a custom error message for uniqueness constraint
        uniqueCaseInsensitive: true,
        validate: {
            validator: function(v) {
                return mongoose.model('User', userSchema).countDocuments({ email: v }).then(count => !count);
            },
            message: props => `${props.value} is already registered`
        }
    },
        image: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true
        },
        course: {
            type: String,
            required: true
        },
        desgination: {
            type: String,
            required: true
        },
        datecreated: { type: Date, default: Date.now } ,
        active: {
        type: Boolean,
        default: true,
    },
 });
    
   
module.exports = mongoose.model('User',userSchema);