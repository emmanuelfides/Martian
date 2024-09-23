/*
Project : Martian
FileName : route.js
Author : Emmark Lab
File Created : 21/07/2021
CopyRights : Emmark Lab
Purpose : This is the file which used to define all route releated to user api request.
*/

var express = require('express')
var router = express.Router();
var userController = require("./../controller/userController")
const { check } = require('express-validator');
var auth = require("./../../../middleware/auth");
var adminauth = require("./../../../middleware/adminauth");
router.get('/',userController.getList)

router.post('/', userController.register)

router.post('/login',[check('username').not().isEmpty(),check('password').not().isEmpty()],userController.login)

router.put('/update/:userId',[auth], userController.update)

router.put('/profilesettings',auth,userController.updatesettings)

router.post('/addfollows',auth,userController.actionFollowers)

router.get('/profile/:userId',userController.details)

router.post('/chat',auth,userController.getListByIds)

router.get('/adminlist',adminauth,userController.getAdminList)

router.post('/updateuser',adminauth, userController.updateUser)

module.exports = router