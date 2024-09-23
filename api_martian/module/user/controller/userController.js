/*
Project : Cryptotrades
FileName : userController.js
Author : Emmark Lab
File Created : 21/07/2021
CopyRights : Emmark Lab
Purpose : This is the file which used to define all user related api function.
*/

var users = require('./../model/userModel')
var follower = require('../model/followerModel');
var jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt');
var validator = require('validator');
var config = require('./../../../helper/config')
var moment = require('moment');
var mailer = require('./../../common/controller/mailController'); 
var media = require('./../../media/controller/mediaController'); 
var cp = require('child_process');
/*
*  This is the function which used to retreive user list
*/
exports.getList = async function(req,res) {
    var logged_id = '';
    if(req.query.user_id) {
        logged_id = req.query.user_id
    }
    var keyword = req.query.keyword ? req.query.keyword : ''; 
    keyword = keyword.replace("+"," ");     
    var page = req.query.page ? req.query.page : '1';  
    var query;  
    if(logged_id) {
       var blockerIDS = [];
       blockerIDS.push(logged_id)
       query = users.find({ '_id' : { $nin : blockerIDS }});
    } else {
       query = users.find();
    }
    var offset = ( page == '1' ) ? 0 : ((parseInt(page-1))*15);
    if ( keyword != '' ) {
        search = { $or: [ { 
            first_name :   {
                $regex: new RegExp(keyword, "ig")
        }  } , {
            last_name : {
                $regex : new RegExp ( keyword , "ig")
            }
        } , {
            email : {
                $regex : new RegExp ( keyword , "ig")
            }
        } ] }
       query = query.or(search)
    }    
    query = query.where('status' , 'active').sort('-create_date')
    var options = {
    select:   'username email profile_image first_name last_name',
    page:page,
    offset:offset,
    limit:15,    
    };  
    users.paginate(query, options).then(function (result) {
        res.json({
            status: true,
            message: "Users retrieved successfully",
            data: result
        });
    }); 
}

/*
*   This is the function which used to retreive user list for admin
*/
exports.getAdminList = async function(req,res) {
    var logged_id = '';
    if(req.query.user_id) {
        logged_id = req.query.user_id
    }
    var keyword = req.query.keyword ? req.query.keyword : ''; 
    keyword = keyword.replace("+"," ");     
    var page = req.query.page ? req.query.page : '1';  
    var query;  
    if(logged_id) {
       var blockerIDS = [];
       blockerIDS.push(logged_id)
       query = users.find({ '_id' : { $nin : blockerIDS }});
    } else {
       query = users.find();
    }
    var offset = ( page == '1' ) ? 0 : ((parseInt(page-1))*15);
    if ( keyword != '' ) {
        search = { $or: [ { 
            first_name :   {
                $regex: new RegExp(keyword, "ig")
        }  } , {
            last_name : {
                $regex : new RegExp ( keyword , "ig")
            }
        } , {
            email : {
                $regex : new RegExp ( keyword , "ig")
            }
        } ] }
       query = query.or(search)
    }    
    query = query.sort('-create_date')
    var options = {
    select:   'username email profile_image first_name last_name status',
    page:page,
    offset:offset,
    limit:15,    
    };  
    users.paginate(query, options).then(function (result) {
        res.json({
            status: true,
            message: "Users retrieved successfully",
            data: result
        });
    }); 
}

/*
*  This is the function which used to retreive user list
*/
exports.getListByIds = async function(req,res) {
    var query = users.find({ '_id' : { $in : req.body.users }});
    query.select('_id username first_name last_name profile_image');
    query.exec( function (err, data) { 
        res.json({
            status: true,
            message: "Users retrieved successfully",
            data: data
        });
    });    
}

exports.login = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  

    if(validator.isEmail(req.body.username)) {
        params = {email:req.body.username};
    } else {
        params = {username:req.body.username};
    } 
    this.loginUser(params,req,res);
}

loginUser = function(params,req,res) {
    users.findOne(params, function (err, user) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "User not found",
            });
            return;
        }  
        user.comparePassword(req.body.password, (error, match) => {
            if(!match) {
                res.json({
                    status: false,
                    message: "Password is mismatch"
                });
                return;
            }
            if( user.status == 'inactive') {
                res.json({
                    status: false,
                    message: "Your account has been inactive. contact admin to activate your account",
                });
                return;
            }
            if(user.status == 'blocked') {
                res.json({
                    status: false,
                    message: "Your account has been blocked. contact admin to activate your account",
                });
                return;
            }        
            console.log(req.body.device_info)
            if(req.body.device_info) {
                var device_info = JSON.parse(req.body.device_info);
                user.device_info = device_info;
                user.save(function(err){
                    let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',status:user.status,dob:user.dob,phone:user.phone, role:user.role},
                    config.secret_key,
                    { expiresIn: '24h' // expires in 24 hours
                    }
                    );
                    res.json({
                        status: true,
                        token:token,
                        message:"Login successful",
                    }); 
                })
            } else {
                let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',status:user.status,dob:user.dob,phone:user.phone, role:user.role},
                config.secret_key,
                { expiresIn: '24h' // expires in 24 hours
                }
                );
                res.json({
                    status: true,
                    token:token,
                    message:"Login successful",
                }); 
            }
            
      
        });
    });
}

/*
*  This is the function which used to retreive user detail by user id
*/
exports.details = function(req,res) {
    users.findOne({_id:req.params.userId}).select('username email first_name last_name spotify discord telegram twitch twitter instagram youtube website genre occupation region about desc profile_image profile_cover metamask_info password status create_date').exec( function (err, user) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"User not found"
            });
            return;
        }
        if(this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"User not found"
            });
            return;
        } 
        res.json({
            status: true,
            message: "Profile info retrieved successfully",
            result: user
        });
    })
}

/*
*  This is the function which used to create new user in Cryptotrades
*/
exports.register = function(req,res) {
    if(req.body.social_info) {
        this.checkSocialUserExist(req,res,function(result) {
            if(result) {
                var social_info = JSON.parse(req.body.social_info)
                var params;
                if (social_info.type == "metamask") {
                    params = {'metamask_info.id':social_info.id}
                }
                this.loginUserWithSocial(params,req,res);
            } else {
                var social_info = JSON.parse(req.body.social_info)
                this.registerUser(req,res);
            }
        });
    } else {
        res.json({
            status: false,
            message: "Request failed. register not accepted without connect wallet",
        });
    } 
}

/**
 *   This is the function handle user registration
 */
registerUser = function (req,res) { 
    
    var user = new users();
    user.username = req.body.username ? req.body.username : "";
    user.email = req.body.email ? req.body.email : "";
    user.password = req.body.password ? req.body.password : "";
    user.first_name = req.body.first_name ? req.body.first_name : "";
    user.last_name = req.body.last_name ? req.body.last_name : "";
    user.desc = req.body.desc ? req.body.desc : "";
    user.about = req.body.about ? req.body.about : "";
    user.region = req.body.region ? req.body.region : "";
    user.occupation = req.body.occupation ? req.body.occupation : "";
    user.genre = req.body.genre ? req.body.genre : "";
    user.website = req.body.website ? req.body.website : "";
    user.instagram = req.body.instagram ? req.body.instagram : "";
    user.twitter = req.body.twitter ? req.body.twitter : "";
    user.youtube = req.body.youtube ? req.body.youtube : "";
    user.twitch = req.body.twitch ? req.body.twitch : "";
    user.telegram = req.body.telegram ? req.body.telegram : "";
    user.discord = req.body.discord ? req.body.discord : "";
    user.spotify = req.body.spotify ? req.body.spotify : "";
    user.phone = req.body.phone ? req.body.phone : "";
    user.profile_image = req.body.profile_image ? req.body.profile_image : "";
    user.dob = req.body.dob ? req.body.dob : "";

    if(req.body.device_info) {
        var device_info = JSON.parse(req.body.device_info);
        user.device_info = device_info;
    }
    
    if(req.body.social_info) {
        var social_info = JSON.parse(req.body.social_info);
        social_info = {
            id : social_info.id ? social_info.id : '',
            type : social_info.type ? social_info.type : '',
        }      

        let username = randomstring.generate({
            length: 10,
            charset: 'alphabetic'
            });  
        user.username = username
        user.metamask_info = social_info;

    } 
    user.status = 'active';

    user.save(function (err , user) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        } 
        let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',status:user.status,dob:user.dob,phone:user.phone, role: user.role},
        config.secret_key,
        { expiresIn: '24h' // expires in 24 hours
        }
        );

        res.json({
            status: true,
            token:token,
            message:"Registration successful",
        });
    });
}

/*
*  This function used to find whether user name exist or not
*/
checkUserNameExist = function (req,res,callback) {
    if(req.body.username) {
        users.find({'username':req.body.username},function(err,data) {
            if(err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(data.length>0) {
                res.json({
                    status: false,
                    message: "User Name already Exist",
                    errors:"User Name already Exist"
                });
                return;
            }
            callback(true)
        })
    } else {
        res.json({
            status: false,
            message: "User Name is required",
            errors:"User Name is required"
        });
        return;
    }
}

/*
*  This function used to find whether email exist or not
*/
checkEmailExist = function (req,res,callback) {
    if(req.body.email) {
        users.find({'email':req.body.email},function(err,data) {
            if(err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(data.length>0) {
                res.json({
                    status: false,
                    message: "Email already Exist",
                    errors:"Email already Exist"
                });
                return;
            }
            callback(true)
        })
    } else {
        res.json({
            status: false,
            message: "Email is required",
            errors:"Email is required"
        });
        return;
    }
}

/**
 * This is the function which used to check if user social account have or not
 */
checkSocialUserExist = function (req,res,callback) {
    var social_info = JSON.parse(req.body.social_info)
    var params;
    if (social_info.type == "metamask") {
        params = {'metamask_info.id':social_info.id}
    }
    users.find(params,function(err,data) {
        if(err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(data.length>0) {
            callback(true)
        } else {
            callback(false);
        }
        
    })
    
}

/**
 * This is the function which used to process login user with social login
 */
loginUserWithSocial = function(params,req,res) {
    users.findOne(params, function (err, user) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "User not found",
            });
            return;
        }  
        if( user.status == 'inactive') {
            res.json({
                status: false,
                message: "Your account has been inactive. contact admin to activate your account",
            });
            return;
        }
        if(user.status == 'blocked') {
            res.json({
                status: false,
                message: "Your account has been blocked. contact admin to activate your account",
            });
            return;
        }          

        if(req.body.device_info) {
            var device_info = JSON.parse(req.body.device_info);
            user.device_info = device_info;
            user.save(function(err){
                let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',status:user.status,dob:user.dob,phone:user.phone, role:user.role},
                config.secret_key,
                { expiresIn: '24h' // expires in 24 hours
                }
                );
            res.json({
                status: true,
                token:token,
                message:"Login successful",
            });  
            });
        } else {
            let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',status:user.status,dob:user.dob,phone:user.phone, role:user.role},
            config.secret_key,
            { expiresIn: '24h' // expires in 24 hours
            }
            );
            res.json({
                status: true,
                token:token,
                message:"Login successful",
            });  
        }   
    });
}



/*
*  This is the function which used to update user profile
*/
exports.update = function(req,res) {
    var user_id = req.decoded.user_id;  
    var params = {};
    params['_id'] = { $ne :  user_id };
    var query  = users.find();
    if (req.body.email) {
        params['email'] = req.body.email;        
    }  
    if (req.body.username) {
        params['username'] = req.body.username;        
    }  
    query = users.find(params); 
    query.exec( function (err, data) { 
        if(req.body.email || req.body.username) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(data.length>0) {
                res.json({
                    status: false,
                    message:"Email or Username already exist"
                });
                return;
            } 
        }

        users.findOne({_id:req.decoded.user_id}, function (err, user) {
                if (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors:err
                    });
                    return;
                }
                if(this.isEmptyObject(user)) {
                    res.json({
                        status: false,
                        message:"User not found"
                    });
                    return;
                } 
                if(user.status == 'inactive') {
                    res.json({
                        status: false,
                        message:"Your account has been inactive. Contact admin to activate your account"
                    });
                    return;
                }
                if(user.status == 'blocked') {
                    res.json({
                        status: false,
                        message:"Your account has been blocked. Contact admin to activate your account"
                    });
                    return;
                }
                user.first_name = req.body.first_name ? req.body.first_name : user.first_name;
                user.last_name = req.body.last_name ? req.body.last_name : user.last_name;
                user.profile_image = req.body.profile_image ? req.body.profile_image : user.profile_image;                 
                user.profile_cover = req.body.profile_cover ? req.body.profile_cover : user.profile_cover;       
                user.email = req.body.email ? req.body.email : user.email;         
                user.username = req.body.username ? req.body.username : user.username;           
                user.dob = req.body.dob ? req.body.dob : user.dob;
                user.phone = req.body.phone ? req.body.phone : user.phone;
                if(req.body.password) {
                    user.password = req.body.password
                }
                if(req.body.social_info) {
                    var social_info = JSON.parse(req.body.social_info);
                    social_info = {
                        id : social_info.id ? social_info.id : '',
                        type : social_info.type ? social_info.type : '',
                    }      
                    if(social_info.type == "metamask") {
                        user.metamask_info = social_info;
                    } 
                }

                if(req.body.device_info) {
                    var device_info = JSON.parse(req.body.device_info);
                    user.device_info = device_info;
                }
                 
                user.modified_date = moment().format();
                // save the user and check for errors
                user.save(function (err , user ) {
                    if (err) {
                        res.json({
                            status: false,
                            message: "Request failed",
                            errors:err
                        });
                        return;
                    }

                        let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,profile_image:user.profile_image ? user.profile_image : '',status:user.status,dob:user.dob,social_info:user.social_info,phone:user.phone, role: user.role},
                        config.secret_key,
                        { expiresIn: '24h' // expires in 24 hours
                        }
                        );
                        res.json({
                            status: true,
                            token:token,
                            message:"profile updated successfully",
                        }); 
                                            
                });
            });
        })
}

/*
*  This is the function which used to update user profile
*/
exports.updatesettings = function(req,res) {
    users.findOne({_id:req.decoded.user_id}, function (err, user) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(user)) {
            res.json({
                status: false,
                message:"User not found"
            });
            return;
        } 
        if(user.status == 'inactive') {
            res.json({
                status: false,
                message:"Your account has been inactive. Contact admin to activate your account"
            });
            return;
        }
        if(user.status == 'blocked') {
            res.json({
                status: false,
                message:"Your account has been blocked. Contact admin to activate your account"
            });
            return;
        }
        user.is_notification = req.body.is_notification;        
        user.modified_date = moment().format();
        user.save(function (err , user ) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            res.json({
                status: true,
                message:"profile settings updated successfully",
            }); 
                    
        });
    });
}

/**
 *   This is the function check object is empty or not
 */
exports.getUserInfoByID = function (userId, callback) {
    users.findOne({_id:userId}).lean().exec( function (err, user) {
        if (err) {
            callback(err,null)
            return;
        }
        if(this.isEmptyObject(user)) {
            callback({
                status: false,
                message: "Request failed",
                errors:"User not found"
            },null);
            return;
        } 
        user.profile_image = user.profile_image ? user.profile_image : '';       
        callback(null,user)
    })
}


/**
 *   This is the function check object is empty or not
 */
isEmptyObject = function (obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
}



/*
*   This is the function which used to update user profile from admin
*/
exports.updateUser = function(req,res) {
    var user_id = req.body.user_id;  
    var params = {};
    params['_id'] = { $ne :  user_id };
    var query  = users.find();
    if (req.body.email) {
        params['email'] = req.body.email;        
    }  
    if (req.body.username) {
        params['username'] = req.body.username;        
    }  
    query = users.find(params); 
    query.exec( function (err, data) { 
        if(req.body.email || req.body.username) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(data.length>0) {
                res.json({
                    status: false,
                    message:"Email or Username already exist"
                });
                return;
            } 
        }

        users.findOne({_id:req.body.user_id}, function (err, user) {
                if (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors:err
                    });
                    return;
                }
                if(this.isEmptyObject(user)) {
                    res.json({
                        status: false,
                        message:"User not found"
                    });
                    return;
                } 
                user.first_name = req.body.first_name ? req.body.first_name : user.first_name;
                user.last_name = req.body.last_name ? req.body.last_name : user.last_name;
                user.profile_image = req.body.profile_image ? req.body.profile_image : user.profile_image;                 
                user.profile_cover = req.body.profile_cover ? req.body.profile_cover : user.profile_cover;       
                user.email = req.body.email ? req.body.email : user.email;         
                user.username = req.body.username ? req.body.username : user.username;           
                user.dob = req.body.dob ? req.body.dob : user.dob;
                user.phone = req.body.phone ? req.body.phone : user.phone;
                if(req.body.password) {
                    user.password = req.body.password
                }
                user.status = req.body.status ? req.body.status : ''
                user.modified_date = moment().format();
                user.save(function (err , user ) {
                    if (err) {
                        res.json({
                            status: false,
                            message: "Request failed",
                            errors:err
                        });
                        return;
                    }
                    res.json({
                        status: true,
                        message:"profile updated successfully",
                    });                         
                });
            });
        })
}


/*
* This is the function which used to add followers
*/
exports.actionFollowers = function(req,res) {
    users.findOne({_id:req.body.user_id, status:"active"}, function (err, user) {
        if (err || !user) {
            res.json({
                status: false,
                message: "User not found",
                errors:err
            });
            return;
        }
        follower.findOne({user_id:req.decoded.user_id}, function (err, followers) {
            if(req.body.type == "increase") {
                if (!followers) {
                    user.follow_count = user.follow_count + 1;
                    var newfollower = new follower();
                    newfollower.user_id = req.decoded.user_id;
                    newfollower.item_id = req.body.item_id;
                    newfollower.save(function(err,result){
                        item.save(function(err,result){
                            res.json({
                                status: true,
                                message: "Followed",
                            });
                        })
                    })
                } else {
                    res.json({
                        status: true,
                        message: "Followed",
                    });
                }
            } else {
                if (!favourite) {
                    res.json({
                        status: true,
                        message: "Unfollowed",
                    });
                } else {
                    item.like_count = item.like_count - 1;
                    favourites.deleteOne({_id:favourite._id},function(err) {
                        item.save(function(err,result){
                            res.json({
                                status: true,
                                message: "Unfollowed",
                            });
                        })
                    })
                }
            }
            
        })
        
    });
}




