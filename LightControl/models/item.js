
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    power: {type: Number, required: true},
    location: {type: String, required: true},
    description: {type: String, required: true},

});

module.exports = mongoose.model('Item', schema);