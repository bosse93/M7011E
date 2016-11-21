var express = require('express');
var router = express.Router();
var passport = require('passport');



/* GET home page. */
router.get('/', forceLogIn, function(req, res, next) {
  res.render('index', { title: 'Express', projectName: 'Light Control'  });
});


module.exports = router;

function forceLogIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/user/signin');
}