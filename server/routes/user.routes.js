var userCtrl = require('../controllers/user.ctrl');
var express = require('express'),
    router = express.Router();

router.put('/searchForMatch', userCtrl.searchForMatch);
router.put('/twilioToken', userCtrl.getToken);
router.put('/getMatchInfo', userCtrl.getMatchInfo);
router.put('/stats', userCtrl.stats);
router.post('/login', userCtrl.login);


// Preferences
router.put('/showPrevPreferences', userCtrl.showPrevPreferences);
router.post('/preferences', userCtrl.preferences);
// Mobile ONLY
router.put('/getSelectionList', userCtrl.getSelectionList);
router.put('/updateSelection', userCtrl.updateSelection);
router.post('/submitBirthday', userCtrl.submitBirthday);

module.exports = router;