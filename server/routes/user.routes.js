var userCtrl = require('../controllers/user.ctrl');
var express = require('express'),
    router = express.Router();

router.put('/searchForMatch', userCtrl.searchForMatch);
router.put('/twilioToken', userCtrl.getToken);
router.put('/receiveRoomId', userCtrl.receiveRoomId);
router.get('/login', userCtrl.login);

router.put('/preferences', userCtrl.preferences);


module.exports = router;