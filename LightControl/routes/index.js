var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', projectName: 'Light Control'  });
});

/* GET home page. */
router.get('/bootstrap', function(req, res, next) {
  res.render('bootstrap', { title: 'Bootstrap'});
});

module.exports = router;
