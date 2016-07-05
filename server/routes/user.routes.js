var userCtrl = require('../controllers/user.ctrl');
var express = require('express'),
    router = express.Router();

router.put('/searchForMatch', userCtrl.searchForMatch);
router.put('/twilioToken', userCtrl.getToken);
router.put('/getMatchInfo', userCtrl.getMatchInfo);
router.put('/stats', userCtrl.stats);
router.post('/login', userCtrl.login);

router.put('/showPrevPreferences', userCtrl.showPrevPreferences);
router.post('/preferences', userCtrl.preferences);


module.exports = router;