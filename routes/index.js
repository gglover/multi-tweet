var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('tweets', { title: '@cute_twoot', charset: CONFIG.charset});
});

router.get('/about', function(req, res) {
  res.render('about');
});

module.exports = router;
