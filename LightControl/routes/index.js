var express = require('express');
var router = express.Router();
var passport = require('passport');


/* GET home page. */
router.get('/', forceLogIn, function(req, res, next) {
  res.render('index', { title: 'Express', projectName: 'Light Control'  });
});

router.get('/viewHouse', function(req,res,next){
  if(!req.session.houseHold) {
    return res.render('houseHold/display', {items: null, bosse: "Bosse är noob.", test: ["1", "2", "3", "4"]});
  }
  var houseHold = new houseHold(req.session.houseHold);
});

router.get('/addLamp', function(req, res, next){
    return res.render('houseHold/addLamp', {items: null});
});
/*

router.post('/addLamp', function());
*/

module.exports = router;

function forceLogIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/user/signin');
}