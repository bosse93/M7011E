var User = require('../models/user').User;
var jwt = require('jsonwebtoken');
var confJWT = require('../config/JWT');

module.exports = function(router, passport) {
    router.get('/', function(req, res){
        res.render('index', { title: 'LightControl', layout: 'loginLayout' });
    });

    router.post('/authenticate', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (err) {
                return res.status(500).json({message: "Error with database when authenticating token."});
            } else if (!user) {
                return res.status(401).json(info);
            } else {
                return res.json({message: "Success"});
            }
        })(req, res, next);
    });

    /**
     * LOCAL
     */

    router.post('/signin', function(req, res, next) {
        passport.authenticate('local.signin', {session: false}, function(err, user, info) {
            if (err) {
                return res.status(500).json({message: "Error when trying to authenticate. User credentials might be right."});
            } else if (!user) {
                return res.status(401).json({message: info});
            } else {
                var myToken = jwt.sign({userID: user._id}, confJWT.secret);
                return res.json(myToken);
            }
        })(req, res, next);
    });
    

    router.post('/signup', function(req, res, next) {
        passport.authenticate('local.signup', {session: false}, function(err, user, info) {
            if (err) {
                return res.status(500).json({message: "Error when adding user to database."});
            } else if (!user) {
                return res.status(401).json({message: info});
            } else {
                var myToken = jwt.sign({userID: user._id}, confJWT.secret);
                return res.json(myToken);
            }
        })(req, res, next);
    });

    /**
     * GOOGLE
     */
    router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));


    router.get('/google/callback',
    passport.authenticate('google', {failureRedirect: '/auth', session: false}),
    function(req, res) {
        var myToken = jwt.sign({userID: req.user._id}, confJWT.secret);
        res.render('user/loginRedirect.hbs', {token: myToken, layout: 'loginLayout'});
    });


    /**
     * FACEBOOK
     */
    router.get('/facebook', passport.authenticate('facebook', {scope: ['email'], session: false}));


    router.get('/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/auth', session: false}),
    function(req, res) {
        var myToken = jwt.sign({userID: req.user._id}, confJWT.secret);
        res.render('user/loginRedirect.hbs', {token: myToken, layout: 'loginLayout'});              
    });  

};