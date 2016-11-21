var express = require('express');
var router = express.Router();

var Item = require('../models/item');
var HouseHold = require('../models/houseHold');


router.get('/view-house', function(req,res,next){
    HouseHold.find({owner: req.user}, function (err, houses) {
        if (err) {
            return console.log('error trying to find house');
        }
        
        if(houses.length == 0) {
            return res.render('HouseHold/view-house', {needHouse: true});
        }
        //console.log(houses[0].owner);
        var roomArr1 = findMatches(houses[0]);
        res.render('HouseHold/view-house', {needHouse: false, house: houses[0], roomArr: roomArr1});
        console.log(req.session.test);
    });
});

router.post('/view-house', function (req, res, next) {
    if(!req.session.HouseHold) {
        return res.redirect('/add-lamp');
    }
    var house = new HouseHold(req.session.HouseHold);
});

router.get('/add-house', function (req, res, next) {
   res.render('houseHold/add-house');
});

router.post('/add-house', function (req, res, next) {
    var house = new HouseHold({
        name: req.body.name,
        owner: req.user,
        items: [],
        locations: [],
        description: req.body.description
    });
    console.log(house);
    house.save(function (err, result) {
        if (err) {
            //return res.redirect('/');
            console.log(err);
            return console.log('FAILED TO SAVE HOUSE');
        }
        console.log('created new house object');
        console.log(req.user._id);
        console.log(house._id);
        
        res.redirect('/house/edit-house');
    });
});


router.get('/edit-house', function (req, res, next) {
    HouseHold.find({owner: req.user}, function (err, houses) {
        if (err) {
            return console.log('error trying to find house');
        }
        if(houses.length == 0) {
            //again we have no house
            return res.render('houseHold/edit-house', {needHouse: true});
        }
        var roomArr1 = findMatches(houses[0]);
        console.log(roomArr1);
        res.render('HouseHold/edit-house', {needHouse: false, house: houses[0], roomArr: roomArr1})
    });
});


/**
 * Checks if we have a house to edit, else redirects
 * Creates a new item from post form
 * Saves the new item and adds it to our house in its callback
 * Saves the changes to our house to DB
 */
router.post('/add-item', function (req, res, next) {
    //add locations
    
    HouseHold.find({owner: req.user}, function (err, houses) {
        if (err) {
            return console.log('error trying to find house');
        }
        //create new item & save the item, in the save callback add item to houseHold item array (houses[0].addItem(item); & then update houseHold in DB.
        var item = new Item({
            name: req.body.name,
            power: req.body.power,
            location: req.body.location,
            description: req.body.description
        });
        item.save(function (err, result) {
            if (err) {
                return console.log('wtf error when trying to save item');
            }
            houses[0].addItem(houses[0], item);
        });
    });
    res.redirect('/house/edit-house');
});


router.post('/add-room', function (req, res, next) {
    console.log("Hej");
    HouseHold.find({owner: req.user}, function (err, houses) {
        if (err) {
            return console.log('error');
        }
        houses[0].addLoc(houses[0], req.body.location);
        console.log(houses[0].locations);
        
    });
    res.redirect('/house/edit-house');
});

module.exports = router;


function findMatches(house) {
    var newArr = [];
    console.log(house);
    
    house.locations.forEach(function(element) {
        var newArr2 = []; 
        
        house.items.forEach(function(element1) {
            if(element == element1.location){
                newArr2.push(element1);
            }
        });
        
        newArr.push(newArr2);
    });
    return newArr;
}