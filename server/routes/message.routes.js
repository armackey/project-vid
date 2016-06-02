var express = require('express');
var router = express.Router();
var msgCtrl = require('../controllers/message.ctrl');

router.put('/threads', msgCtrl.getThreads);
router.put('/getMessages', msgCtrl.getMessages);

module.exports = router;