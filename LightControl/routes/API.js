var fs = require('fs');
var HouseHold = require('../models/houseHold');
var User = require('../models/user').User;
var dbFile = require('../models/user').File;
var homeUnit = require('../models/user').homeUnit;
var jwt = require('jsonwebtoken');

var mkdirp = require('mkdirp');
var path = require('path');
var formidable = require('formidable');

module.exports = function(router, passport) {

    /**
     * LOG PATHS AND PATHS TO SEE WHO TRIES TO DO SHIT
     */
    
    router.use(function(req, res, next){
        fs.appendFile('logs.txt', req.path + " token: " + req.query.Authorization + "\n",
            function(err){
                next();
            });
    });

    router.post('/editHomeUnitInfo', function(req, res, next){
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            }
            if (!req.body.ip || !req.body.port) {
                return res.status(400).json({message: "Missing input."});
            }
            homeUnit.findOne({'user': user}, function(err, homeUnitObject) {
                if(!homeUnitObject) {
                    var newHomeUnit = new homeUnit({
                        user: user,
                        ip: req.body.ip,
                        port: req.body.port
                    });
                    newHomeUnit.save(function(err, savedHomeUnit) {
                        return res.json(savedHomeUnit);
                    });
                }
                else {
                    homeUnitObject.update({$set: {ip: req.body.ip, port: req.body.port}},
                    function(err, result) {
                        homeUnit.findOne({'user': user}, function(err, homeUnitObject) {
                            return res.json(homeUnitObject);
                        });
                    });
                }
            });       
        })(req, res, next);
    });

    router.get('/getHomeUnitInfo', function(req, res, next){
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            }
            homeUnit.findOne({'user': user}, function(err, homeUnitObject) {
                if(!homeUnitObject) {
                    var newHomeUnit = new homeUnit({
                        user: user
                    });
                    newHomeUnit.save(function(err, savedHomeUnit) {
                        return res.json(savedHomeUnit);
                    });
                }
                else {
                    return res.json(homeUnitObject);
                }
            })       
        })(req, res, next);
    });
    
    router.get('/myFiles', function(req, res, next){
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            } else {
                dbFile.findOne({'user': user}, function(err, fileCollection) {
                    if(!fileCollection) {
                        return res.status(400).json({message: "This user got no uploaded files"});
                    }else{
                        return res.json(fileCollection.paths);
                    }
                });
            }
        })(req, res, next);
    });

    router.post('/uploadItemFile/*', function(req, res, next){
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            }
            
            // create an incoming form object
            var form = new formidable.IncomingForm();
            
            // specify that we want to allow the user to upload multiple files in a single request
            form.multiples = false;
            
            var url = req.url;
            var itemId = url.substring(url.lastIndexOf('/') + 1);  
            
            HouseHold.Item.findById(itemId, function(err, itemObject) {
                if (!itemObject) {
                    return res.status(400).json({message: "This item ID doesn't exist."});
                }
                if (String(itemObject.owner) != user) {
                    return res.status(401).json({message: "You can only add images to your own items."});
                }
                var directory = "/public/images/" + user;
                mkdirp(("."+directory), function(err) {
                    if (err) {
                        return res.status(500).json({message: "Error making new user file folder"});
                    }

                    // store all uploads in the /uploads directory
                    form.uploadDir = "."+directory;

                    form.on('file', function (field, file) {
                        fs.rename(file.path, path.join(form.uploadDir, itemId));
                    });
                    // log any errors that occur
                    form.on('error', function (err) {
                        return res.status(500).json({message: "Error on file upload"});
                    });
                        
                    // once all the files have been uploaded, send a response to the client
                    form.on('end', function () {
                        var tempFilePath = String("http://79.136.28.57:8000/images/" + user + '/' + itemId);
                        itemObject.update({$set: {filePath: tempFilePath}}, function(err, result) {
                        });
                        return res.status(201).json(tempFilePath);
                    });
                        
                    form.parse(req);
                });
            });
        })(req, res, next);
    });

    router.post('/upload', function(req, res, next){
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            } else {
                // create an incoming form object
                var form = new formidable.IncomingForm();

                // specify that we want to allow the user to upload multiple files in a single request
                form.multiples = false;
                
                var directory = "/public/images/" + user;
                mkdirp(("."+directory), function(err) {
                    if (err) {
                        return res.status(500).json({message: "Error making new user file folder"});
                    } else {

                        // store all uploads in the /uploads directory
                        form.uploadDir = "."+directory;

                        dbFile.findOne({'user': user}, function(err, fileCollection) {
                            // every time a file has been uploaded successfully,
                            // rename it to it's orignal name
                            form.on('file', function (field, file) {
                                fs.rename(file.path, path.join(form.uploadDir, file.name));
                                var tempFilePath = String("http://79.136.28.57:8000/images/" + user + '/' + file.name);
                                if(!fileCollection) {
                                    var newFile = new dbFile({
                                        user: user,
                                        paths: tempFilePath
                                    });
                                    newFile.save(function(err, savedFileCollection){
                                    });
                                }else{
                                    fileCollection.paths.push(tempFilePath);
                                    fileCollection.update({$set: {paths: fileCollection.paths}}, function(err, result) {
                                    });
                                }
                            });

                            // log any errors that occur
                            form.on('error', function (err) {
                                return res.status(500).json({message: "Error on file upload"});
                            });

                            // once all the files have been uploaded, send a response to the client
                            form.on('end', function () {
                                res.end('success');
                            });
                            form.parse(req);
                        });
                    }
                });
            }
        })(req, res, next);
    });
    
    router.post('/addHouse', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            } else {
                HouseHold.House.findOne({'owner': user}, function(err, houseObject) {
                    if (houseObject) {
                        return res.status(400).json({message: "User already got a house. One house per user."});
                    } else {
                        User.findById(user, function(err, userObject) {

                            var newHouse = new HouseHold.House({
                                name: (userObject.facebook.name || userObject.local.email || userObject.google.name) + "'s house",
                                owner: userObject._id
                            });
                            newHouse.save(function (err, savedHouse) {
                                    return res.json(savedHouse);
                            });
                        });
                    }
                });
            }
        })(req, res, next);    
    });

    
    router.get('/myHouse', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            } else {
                HouseHold.House.findOne({'owner': user}, function (err, house) {
                    if (!house){
                        return res.status(400).json({message: "This user got no house yet."});
                    } else {
                        return res.json(house);
                    }
                });
            }
        })(req, res, next);
    });
    
    
    router.post('/addLocation', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            } else {
                if (!req.body.newRoomName) {
                    return res.status(400).json({message: "Missing input."});
                }
                HouseHold.House.findOne({'owner': user}, function (err, userHouse){
                    if (!userHouse) {
                        User.findById(user, function(err, userObject) {                             
                            var newHouse = new HouseHold.House({
                                name: (userObject.facebook.name || userObject.google.name || userObject.local.email) + "'s house",
                                owner: userObject._id
                            });
                            newHouse.save(function(err, newSavedHouse){
                                var newLocation = new HouseHold.Location({
                                    name: req.body.newRoomName,
                                    house: newSavedHouse._id,
                                    owner: user
                                });
                                newLocation.save(function (err, newLoc) {
                                    newSavedHouse.locations.push(newLoc._id);
                                    newSavedHouse.update({$set: {locations: newSavedHouse.locations}}, function (err, result) {
                                        return res.json(newLoc);
                                    });
                                    
                                });
                            }); 
                        });
                    } else {
                        var newLocation = new HouseHold.Location({
                            name: req.body.newRoomName,
                            house: userHouse._id,
                            owner: user
                        });
                        newLocation.save(function (err, newLoc) {
                            userHouse.locations.push(newLoc._id);
                            userHouse.update({$set: {locations: userHouse.locations}}, function (err, result) {
                                return res.json(newLoc);
                                
                            });
                            
                        });
                    }
                });
            }
        })(req, res, next);
    });

    router.post('/getLocation', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            }
            if (!req.body.locationId) {
                return res.status(400).json({message: "Missing input."});
            }
            HouseHold.Location.findById(req.body.locationId)
                .populate({
                    path: 'items'
                })
                .exec(function(err, locationObject) {
                    if (!locationObject) {
                        return res.status(400).json({message: "There is no location with this ID."});
                    }
                    if(String(locationObject.owner) != user) {
                        return res.status(401).json({message: "You do not own this location."});
                    }
                    return res.json(locationObject);     
            });
        })(req, res, next);
    });

    
    
    router.post('/addItem', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            } else {
                HouseHold.House.findOne({'owner': user}, function(err, houseObject) {
                    if (!houseObject) {
                        return res.status(400).json({message: "User got no house to add items to. Create a house first."});
                    } else {
                        if (!req.body.newLampName || !req.body.newLampPower || !req.body.newLampLocation) {
                            return res.status(400).json({message: "Missing input."});
                        }
                        if (!req.body.newLampDescription) {
                            var newItem = new HouseHold.Item({
                                name: req.body.newLampName,
                                owner: user,
                                power: req.body.newLampPower,
                                location: req.body.newLampLocation,
                                description: "" 
                            });
                        } else {
                            var newItem = new HouseHold.Item({
                                name: req.body.newLampName,
                                owner: user,
                                power: req.body.newLampPower,
                                location: req.body.newLampLocation,
                                description: req.body.newLampDescription
                            });
                        }
                        HouseHold.Location.findById(newItem.location, function(err, locationObject) {
                            if (!locationObject) {
                                return res.status(400).json({message:"Bad location. Location does not exist."});
                            } else {
                                if (String(locationObject.house) == String(houseObject._id)) {
                                    newItem.save(function (err, newSavedItem) {
                                        locationObject.items.push(newSavedItem._id);
                                        locationObject.update({$set: {items: locationObject.items}}, function (err, result) {
                                            return res.json(newSavedItem);
                                        })
                                        
                                    });
                                    
                                } else {
                                    return res.status(400).json({message: "User does not own this room."});
                                }
                            }
                        });        
                    }
                });
            }
        })(req, res, next);
    });
    
    router.post('/editItem', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            }
            if (!req.body.itemId || !req.body.newLampPower || !req.body.newLampName) {
                return res.status(400).json({message: "Missing input."});
            }
            HouseHold.Item.findById(req.body.itemId, function(err, itemObject) {
                if (!itemObject) {
                    return res.status(400).json({message: "There is no item with this id in the database."});
                }
                if (String(itemObject.owner) != user) {
                    return res.status(401).json({message: "You do not own this item."});
                }
                
                if (String(req.body.newLampDescription) == "") {
                    var itemDescription = "";
                } else {
                   var itemDescription = req.body.newLampDescription; 
                }
                
                itemObject.update({$set: {name: req.body.newLampName, power: req.body.newLampPower, description: itemDescription}},
                function(err, result) {
                    HouseHold.Item.findById(req.body.itemId, function(err, editedItemObject) {
                        if (!editedItemObject) {
                            return res.status(400).json({message: "Error when returning edited item. Item have been updated in database."});
                        }
                        return res.json(editedItemObject);
                    });  
                });
            });
        })(req, res, next);
    });
    
    router.get('/myItems', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            } else {
                HouseHold.House.findOne({'owner' : user})
                    .populate({
                        path: 'locations',
                        populate: {
                            path: 'items'
                        }
                    })
                    .exec(function(err, houseObject) {
                        if (!houseObject) {
                            return res.status(400).json({message: "User got no room. <br> Go to Edit House and make a new room. "});
                        } else {
                            return res.json({locationArray: houseObject.locations});
                        }
                    });
            }
        })(req, res, next);
    });





    /**
     * ITEMS
     */
    
    router.post('/getItem', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if(!user) {
                return res.status(401).json(info);
            } else {
                if(!req.body.itemId) {
                    return res.status(400).json({message: "Missing input."});
                }
                HouseHold.Item.findById(req.body.itemId, function(err, itemObject) {
                    if (!itemObject) {
                        return res.status(400).json({message: "There is no item with this id in the database."});
                    } else {
                        return res.json(itemObject);
                    }
                });
            }
        })(req, res, next);
    });
    
    

    router.post('/toggleItem', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if(!user) {
                return res.status(401).json(info)
            }else{
                HouseHold.House.findOne({'owner': user}, function(err, houseObject) {
                    if (!houseObject) {
                        return res.status(400).json({message: "User got no house. Add a house."});
                    } else {
                        if (!req.body.itemId) {
                            return res.status(400).json({message: "Missing input."});
                        }
                        HouseHold.Item.findById(req.body.itemId, function(err, itemObject) {
                            if (!itemObject) {
                                return res.status(400).json({message: "An item with this id does not exist."});
                            } else {
                                var ownerCheck = false;
                                houseObject.locations.forEach(function(element) {
                                    if (String(element) == String(itemObject.location)) {
                                        ownerCheck = true;
                                    }
                                });
                                if(!ownerCheck) {
                                    return res.status(400).json({message: "User does not own this item."});
                                } 
                                itemObject.powerOn = !itemObject.powerOn;
                                itemObject.update({$set: {powerOn: itemObject.powerOn}}, function(err, result) {
                                    return res.json(itemObject);
                                });
                            }
                        }); 
                    }
                });   
            }
        })(req, res, next);
    });
    
    router.post('/deleteItem', function(req, res, next) {
        passport.authenticate('jwt', {session: false}, function(err, user, info) {
            if (!user) {
                return res.status(401).json(info);
            } else {
                if (!req.body.itemId) {
                    return res.status(400).json({message: "Bad input. ID not included."});
                }
                HouseHold.Item.findById(req.body.itemId, function(err, itemObject) {
                    if (!itemObject) {
                        return res.status(400).json({message: "No item exist with this id."});
                    } else {
                        HouseHold.Location.findById(itemObject.location, function(err, locationObject) {
                            HouseHold.House.findOne({'owner': user}, function(err, houseObject) {
                                if (String(houseObject._id) == String(locationObject.house)) {
                                    HouseHold.Item.findByIdAndRemove(itemObject._id, function(err, removedItem) {
                                        var index = locationObject.items.indexOf(removedItem._id);
                                        locationObject.items.splice(index, 1);
                                        locationObject.save(function(error, savedLocation) {
                                            return res.json(removedItem);
                                        });
                                    });
                                } else {
                                    return res.status(400).json({message: "This item does not belong to the user."});
                                }
                            });
                            
                        });
                    }
                });
            }
        })(req, res, next);
    });
    
};
               
