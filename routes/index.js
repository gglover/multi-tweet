var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('tweets', { title: 'TIME 2 TWOOT', charset: CONFIG.charset});
});

module.exports = router;
