/*
Project : Martian
FileName : userModel.js
Author : Emmark Lab
File Created : 21/07/2021
CopyRights : Emmark Lab
Purpose : This is the file which used to define user collection that will communicate and process user information with mongodb through mongoose ODM.
*/

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var bcrypt = require('bcrypt');
var validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');
var config = require('./../../../helper/config')



// Setup schema
var userSchema = mongoose.Schema({
    username: {
        type: String,
        minlength: [1, 'User Name must be 1 characters or more'],
        maxlength: [32, "User Name can't exceed 32 characters"],
        validate:[validator.isAlpha ,'UserName  must be alphabetic'],
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    first_name: {
        type: String,
        maxlength: [32, "First Name can't exceed 32 characters"],
        required: false, 
    },
    last_name: {
        type: String,
        maxlength: [32, "Last name can't exceed 32 characters"],
        required: false, 
    },
    desc: {
        type: String,
        required: false, 
    },
    about: {
        type: String,
        required: false, 
    },
    region: {
        type: String,
        required: false, 
    },
    occupation: {
        type: String,
        required: false, 
    },
    genre: {
        type: String,
        required: false, 
    },
    website: {
        type: String,
        required: false, 
    },
    instagram: {
        type: String,
        required: false, 
    },
    twitter: {
        type: String,
        required: false, 
    },
    youtube: {
        type: String,
        required: false, 
    },
    twitch: {
        type: String,
        required: false, 
    },
    telegram: {
        type: String,
        required: false, 
    },
    discord: {
        type: String,
        required: false, 
    }, 
    spotify: {
        type: String,
        required: false, 
    },
    dob:String,   
    phone: {
        type: String,
    },
    profile_image: String,    
    profile_cover: String,            
    metamask_info: {
        type: Map,
        of: String
    },
    follow_count: {
        type: Number,
        default:0
    },
    role: {type:Number, default:2},
    is_notification: {type:Number, default:1},
    is_featured: {type:Number, default:0},
    status:{
        type: String,
        enum : ['active','inactive','blocked','reset']
    },
    device_info:{
        type: Map,
        of: String
    },
    create_date: {
        type: Date,
        default: Date.now
    },
});

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();

    if (user.password.length==0) return next();
    // generate a salt
    bcrypt.genSalt(12, function(err, salt) {
        if (err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
    
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.plugin(uniqueValidator);
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('users', userSchema,config.db.prefix+'users');