var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HouseHoldSchema = new Schema({
    name: {type: String, required: true},
    owner: {type: String, required: true},
    locations: [{type: Schema.Types.ObjectId, ref: 'Location', required: false}]
});


var LocationSchema = new Schema({
    name: {type: String, required: true},
    house: {type: Schema.Types.ObjectId, ref: 'HouseHold', required: true},
    items: [{type: Schema.Types.ObjectId, ref: 'Item', required: false}]
});

var ItemSchema = new Schema({
    name: {type: String, required: true},
    power: {type: Number, required: true},
    location: {type: Schema.Types.ObjectId, ref: 'Location', required: true},
    description: {type: String, required: false},
});





var House = mongoose.model('HouseHold', HouseHoldSchema);
var Location = mongoose.model('Location', LocationSchema);
var Item = mongoose.model('Item', ItemSchema);
var Models = {House: House, Location: Location, Item: Item};

module.exports = Models;

