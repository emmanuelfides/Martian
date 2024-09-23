/*
Project : Martian
FileName : collectionController.js
Author : Emmark Lab
File Created : 21/07/2021
CopyRights : Emmark Lab
Purpose : This is the file which used to define all collection related api function.
*/

var collections = require('../model/collectionModel');
var items = require('../../item/model/itemModel');
var userController = require('./../../user/controller/userController');
var validator = require('validator');
const { validationResult } = require('express-validator');
var cp = require('child_process');
var Web3 = require('web3');
const config = require('../../../helper/config');
var fs = require('fs')
/*
* This is the function which used to add collection in database
*/
exports.add = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed [Collection name already exists]",
            errors:errors.array()
        });
        return;
    }  
    var symbol = req.body.name.replace(" ", "_")
    var collection = new collections();
    collection.name = req.body.name;
    collection.description = req.body.description ? req.body.description : '';
    collection.royalties = req.body.royalties ? req.body.royalties : 0;
    collection.banner = req.body.banner ? req.body.banner : '';
    collection.image = req.body.image ? req.body.image : '';
    collection.status = 0;
    collection.author_id = req.decoded.user_id;
    collection.website = req.decoded.website;
    collection.twitter = req.decoded.twitter;
    collection.instagram = req.decoded.instagram;
    collection.discord = req.decoded.discord;
    collection.chain = req.decoded.chain;
    collection.contract_symbol = symbol;
    collection.save(function (err ,collectionObj) {
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
            message: "Collection created successfully",
            result: collectionObj
        });
    });

}

/*
* This is the function which used to update collection in database
*/
exports.update = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    collections.findOne({_id:req.body.collection_id, author_id: req.decoded.user_id}, function (err, collection) {
        if (err || !collection) {
            res.json({
                status: false,
                message: "Collection not found",
                errors:err
            });
            return;
        } else {
            collection.name = req.body.name ?  req.body.name : collection.name;
            collection.image = req.body.image ?  req.body.image : collection.image;
            collection.banner = req.body.banner ? req.body.banner : collection.banner;
            collection.royalties = req.body.royalties ? req.body.royalties : collection.royalties;
            collection.description = req.body.description ? req.body.description : collection.description;
            collection.contract_address = req.body.contract_address ? req.body.contract_address : collection.contract_address;
            collection.website = req.body.website ? req.body.website : collection.website;
            collection.twitter = req.body.twitter ? req.body.twitter : collection.twitter;
            collection.instagram = req.body.instagram ? req.body.instagram : collection.instagram;
            collection.discord = req.body.discord ? req.body.discord : collection.discord;
            collection.chain = req.body.chain ? req.body.chain : collection.chain;
            if(collection.contract_address) {
                collection.status = 1;
            }
            collection.save(function (err , collection) {
                if (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors:err
                    });
                    return;
                } else {
                    res.json({
                        status: true,
                        message: "Collection updated successfully",
                        result: collection 
                    });  
                }
            });
        }
    });
}

/*
* This is the function which used to delete collection in database
*/
exports.delete = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    collections.findOne({_id:req.body.collection_id, author_id:req.decoded.user_id}, function (err, collection) {
        if (err || !collection) {
            res.json({
                status: false,
                message: "Collection not found",
                errors:err
            });
            return;
        } 
        items.count({_id:req.body.collection_id},function(err,count) {
            if(count == 0) {
                collections.deleteOne({_id:req.body.collection_id},function(err) {
                    res.json({
                        status: true,
                        message: "Collection deleted successfully"
                    }); 
                })
            } else {
                res.json({
                    status: true,
                    message: "Collection has items and you can't delete it"
                }); 
            }

        })
    });
}

/*
 *  This is the function which used to view collection
 */
exports.view = function(req,res) {
    collections.findOne({_id:req.query.collection_id}).exec( function (err, collection) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"Collection not found"
            });
            return;
        }
        if(!collection) {
            res.json({
                status: false,
                message: "Request failed",
                errors:"Collection not found"
            });
            return;
        } 
        res.json({
            status: true,
            message: "Collection info retrieved successfully",
            result: collection
        });
    })
}

/**
 * This is the function which used to list collection with filters
 */
exports.list = function(req,res) {
    var keyword = req.query.keyword ? req.query.keyword : ''; 
    keyword = keyword.replace("+"," ");     
    var page = req.query.page ? req.query.page : '1';  
    var query  = collections.find();
    var offset = ( page == '1' ) ? 0 : ((parseInt(page-1))*10);
    if ( keyword != '' ) {
        search = { $or: [ { 
            name :   {
                $regex: new RegExp(keyword, "ig")
        }  } , {
            description : {
                $regex : new RegExp ( keyword , "ig")
            }
        }] }
       query = query.or(search)
    }    
    if(req.query.type == "my") {
        if(req.decoded.user_id != null) {
            query = query.where('author_id',req.decoded.user_id).sort('-create_date');
        }
    } else if(req.query.type == "item") {
        if(req.decoded.user_id != null) {
            query = query.sort('-item_count');
        }
    } else {
        query = query.where('status' , 1).sort('-create_date')
    }

    var options = {
    select:   'name description banner image royalties item_count contract_symbol',
    page:page,
    offset:offset,
    limit:10,    
    };  
    collections.paginate(query, options).then(function (result) {
        res.json({
            status: true,
            message: "Collection retrieved successfully",
            data: result
        });
    }); 
}

/**
 * This is the function which used to list all items for admin
 */
exports.getAdminList = function(req,res) {
    var keyword = req.query.keyword ? req.query.keyword : ''; 
    keyword = keyword.replace("+"," ");     
    var page = req.query.page ? req.query.page : '1';  
    var query  = collections.find();
    var offset = ( page == '1' ) ? 0 : ((parseInt(page-1))*10);
    if ( keyword != '' ) {
        search = { $or: [ { 
            name :   {
                $regex: new RegExp(keyword, "ig")
        }  } , {
            description : {
                $regex : new RegExp ( keyword , "ig")
            }
        }] }
       query = query.or(search)
    }    
    query = query.sort('-create_date')
    var options = {
    select:   'name description banner image royalties',
    page:page,
    offset:offset,
    limit:10,    
    };  
    collections.paginate(query, options).then(function (result) {
        res.json({
            status: true,
            message: "Collection retrieved successfully",
            data: result
        });
    });
}


/*
 * This is the function which used to generate abi for create contract
 */

 exports.generateABI = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    } 
    const rootPath = __dirname.replace("module/collection/controller","");
    var symbol = req.body.symbol.replace(" ", "_")
    var symbolsol = symbol+'.sol';
    fs.stat(rootPath+symbol+'.bin', function (fileerr, stats) {
        if(fileerr) {
            //var command = 'sh generate.sh '+symbol + ' "' + req.body.name + '" ' +  symbolsol;
            var command = 'sh generate.sh '+symbol + ' "' + req.body.name + '" ' +  symbolsol +' ' + config.rpcurl;
            cp.exec(command, function(err, stdout, stderr) {
                console.log('stderr ',stderr)
                console.log('stdout ',stdout)
                if(err) {
                    res.json({
                        status: false,
                        message: err.toString().split('ERROR: ').pop().replace(/\n|\r/g, "")
                    });
                    return
                }
                fs.readFile(rootPath+symbol+'.bin', 'utf8' , (err, data) => {
                    if (err) {
                      res.json({
                          status: false,
                          message: err.toString().split('ERROR: ').pop().replace(/\n|\r/g, "")
                      });
                      console.error(err)
                      return
                    }
                    res.json({
                        status: true,
                        message: 'generate abi successful',
                        result:data
                    });
                })
            });
        } else {
            fs.readFile(rootPath+symbol+'.bin', 'utf8' , (err, data) => {
                if (err) {
                  res.json({
                      status: false,
                      message: err.toString().split('ERROR: ').pop().replace(/\n|\r/g, "")
                  });
                  console.error(err)
                  return
                }
                res.json({
                    status: true,
                    message: 'generate abi successful',
                    result:data
                });
            })
        }
    })
}




