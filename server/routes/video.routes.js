var express = require('express'),
    videoCtrl = require('../controllers/video.ctrl');
    router = express.Router();

// router.put('callUser', videoCtrl.callUser);
router.post('/justMet', videoCtrl.niceToMeetYou);
router.put('/availToChat', videoCtrl.toggleAvail);
router.put('/inMatching', videoCtrl.inMatching);
router.put('/exit-call', videoCtrl.toggleInCall);

module.exports = router;