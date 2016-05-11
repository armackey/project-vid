var express = require('express');
var router = express.Router();
var msg = require('../routes/message.routes');

router.get('/msg', msg.getMessages);

module.exports = router;