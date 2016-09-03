var videoChatCtrl = require('../controller');
var express = require('express');
var router = express.Router();

router.put('/searchForMatch', videoChatCtrl.searchForMatch);
router.put('/twilioToken', videoChatCtrl.getToken);
router.put('/getMatchInfo', videoChatCtrl.getMatchInfo);

// router.put('/stats', videoChatCtrl.stats);
// router.post('/login', videoChatCtrl.login);


module.exports = router;