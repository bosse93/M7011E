
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    power: {type: Number, required: true},
    location: {type: String, required: true},
    description: {type: String, required: false},

});


schema.methods.getLocation = function () {
  return this.location;
};


module.exports = mongoose.model('Item', schema);