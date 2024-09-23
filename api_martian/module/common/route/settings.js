/*
Project : Martian
FileName : settings.js
Author : Emmark Lab
File Created : 21/07/2021
CopyRights : Emmark Lab
Purpose : This is the file which used to define all route releated to settings api request.
*/

var express = require('express')
var router = express.Router();
var settingsController = require("../controller/settingsController")
var auth = require("../../../middleware/auth");
var adminauth = require("../../../middleware/adminauth");
const { check } = require('express-validator');

// router.get('/install',settingsController.installOptions)
router.post('/setoptions',[check('name').not().isEmpty(),check('value').not().isEmpty(),adminauth],settingsController.setOptions)
router.get('/getoptions',settingsController.getOptions)
module.exports = router