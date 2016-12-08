
module.exports = function(router, passport){
    /**
     * THIS IS THE STANDARD PATH FOR PAGE RENDERING
     */

    router.get('/signup', function(req, res) {
        res.render('user/signup.hbs', {title: 'Sign up', layout: 'loginLayout'});
    });

    router.get('/upload', function(req, res) {
        res.render('upload/upload.hbs', {title: 'upload'});
    });

    
    router.get('/profile', function(req, res){
        res.render('user/profile.hbs', {title: 'Profile'});
    });
    
    router.get('/house', function(req, res) {
       res.render('houseHold/view-house.hbs', {title: 'House'}); 
    });
    
    router.get('/editHouse', function(req, res) {
        res.render('houseHold/edit-house.hbs', {title: 'Edit House'});
    });

    router.get('/API', function (req, res) {
        res.render('API/API.hbs', {title: 'API', layout: 'loginLayout'});
    });

    //catches dead-ends and directs to profile.
    router.get('/*', function(req, res){
        res.redirect('/profile');
    })
    
}