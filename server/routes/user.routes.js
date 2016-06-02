var userCtrl = require('../controllers/user.ctrl');
var express = require('express'),
    router = express.Router();

router.put('/searchForMatch', userCtrl.searchForMatch);
router.put('/twilioToken', userCtrl.getToken);
router.put('/receiveMatch', userCtrl.receiveMatch);
router.put('/availToChat', userCtrl.toggleAvail);
router.post('/login', userCtrl.login);

router.post('/preferences', userCtrl.preferences);


module.exports = router;