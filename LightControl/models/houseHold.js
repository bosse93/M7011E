var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user').User;

var HouseHoldSchema = new Schema({
    name: {type: String, required: true},
    owner: {type: String, required: true},
    locations: [{type: Schema.Types.ObjectId, ref: 'Location', required: false}]
});


var LocationSchema = new Schema({
    name: {type: String, required: true},
    house: {type: Schema.Types.ObjectId, ref: 'House', required: true},
    items: [{type: Schema.Types.ObjectId, ref: 'Item', required: false}],
    owner: {type: Schema.Types.ObjectId, ref: User, required: true}
});

var ItemSchema = new Schema({
    name: {type: String, required: true},
    owner: {type: Schema.Types.ObjectId, ref: User, required: true},
    power: {type: Number, required: true},
    location: {type: Schema.Types.ObjectId, ref: 'Location', required: true},
    description: {type: String, required: false},
    powerOn: {type: Boolean, default: false},
    filePath: {type: String, default: "/images/defaultImage.jpg"}
});





var House = mongoose.model('HouseHold', HouseHoldSchema);
var Location = mongoose.model('Location', LocationSchema);
var Item = mongoose.model('Item', ItemSchema);
var Models = {House: House, Location: Location, Item: Item};

module.exports = Models;

