var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('../models/user');

var configAuth = require('./auth');
var configJWT = require('./JWT');

module.exports = function(passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    
    /**
     * LOCAL SIGNUP STRATEGY
     */
    
    passport.use('local.signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done){
        process.nextTick(function(){
            User.findOne({'local.email': email}, function(err, user){
                if(err)
                    return done(err);
                if(user){
                    return done(null, false, "Email address is already registered.");
                } 
                var newUser = new User();
                newUser.local.email = email;
                newUser.local.password = newUser.encryptPassword(password);

                newUser.save(function(err){
                    if(err){
                        return done(err);
                    }
                });
                return done(null, newUser);
            });
        });
    }));

    
    /**
     * LOCAL SIGNIN STRATEGY
     */
    
    passport.use('local.signin', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },function(req, email, password, done){
            process.nextTick(function(){
                User.findOne({ 'local.email': email}, function(err, user){
                    if(err) {
                        return done(err);
                    }
                    if(!user) {
                        return done(null, false, "Incorrect username.");
                    }
                    if(!user.validPassword(password)){
                        return done(null, false, "Incorrect password.");
                    }
                    return done(null, user);

                });
            });
        }
    ));

    
    /**
     * GOOGLE STRATEGY
     */
    
    passport.use(new GoogleStrategy({
            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
            process.nextTick(function(){

                if(!req.user){
                    User.findOne({'google.id': profile.id}, function(err, user){
                        if(err)
                            return done(err);
                        if(user){
                            if(!user.google.token){
                                user.google.token = accessToken;
                                user.google.name = profile.displayName;
                                user.google.email = profile.emails[0].value;
                                user.save(function(err){
                                    if(err)
                                        throw err;
                                });
                            }
                            return done(null, user);
                        }
                        else {
                            var newUser = new User();
                            newUser.google.id = profile.id;
                            newUser.google.token = accessToken;
                            newUser.google.name = profile.displayName;
                            newUser.google.email = profile.emails[0].value;

                            newUser.save(function(err){
                                if(err)
                                    throw err;
                                return done(null, newUser);
                            })
                        }
                    });
                } else {
                    var user = req.user;
                    user.google.id = profile.id;
                    user.google.token = accessToken;
                    user.google.name = profile.displayName;
                    user.google.email = profile.emails[0].value;

                    user.save(function(err){
                        if(err)
                            throw err;
                        return done(null, user);
                    });
                }

            });
        }

    ));


    /**
     * FACEBOOK STRATEGY
     */
    
    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: configAuth.facebookAuth.profileFields,
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
            process.nextTick(function(){
                //user is not logged in yet
                if(!req.user){
                    User.findOne({'facebook.id': profile.id}, function(err, user){
                        if(err)
                            return done(err);
                        if(user) {
                            if (!user.facebook.token) {
                                user.facebook.token = accessToken;
                                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                                user.facebook.email = profile.emails[0].value;
                                user.save(function (err) {
                                    if (err)
                                        throw err;
                                });
                            }
                            return done(null, user);
                        }
                        else {
                            var newUser = new User();
                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = accessToken;
                            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.facebook.email = profile.emails[0].value;

                            newUser.save(function(err){
                                if(err)
                                    throw err;
                                return done(null, newUser);
                            })
                        }
                    });
                }

                //user is logged in already, and needs to be merged
                else {
                    var user = req.user;
                    user.facebook.id = profile.id;
                    user.facebook.token = accessToken;
                    user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    user.facebook.email = profile.emails[0].value;

                    user.save(function(err){
                        if(err)
                            throw err
                        return done(null, user);
                    })
                }
            });
        }
    ));


    // Setup work and export for the JWT passport strategy
    
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = configJWT.secret;
    opts.passReqToCallback = true;
    passport.use(new JwtStrategy(opts, function(req, jwt_payload, done) {
        process.nextTick(function(){
            User.findById(jwt_payload.userID, function(err, user) {
                if (err) {
                    return done(err);
                } else if (!user){
                    return done(null, false);
                } else {
                    return done(null, user._id);
                }
            });
        })
    }));
};



