var prefCtrl = require('../controller');
var express = require('express');
var router = express.Router();

router.put('/showPrevPreferences', prefCtrl.getPreferences);
router.post('/preferences', prefCtrl.setPreferences);
router.put('getStats', prefCtrl.getStats);
// Mobile ONLY
router.put('/getSelectionList', prefCtrl.getSelectionList);
router.put('/updateSelection', prefCtrl.updateSelection);
router.post('/submitBirthday', prefCtrl.submitBirthday);


module.exports = router;