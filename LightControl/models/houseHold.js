var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    owner: {type: Object, required: true},
    items: {type: Array, required: false},
    locations: {type: Array, required: false}
});

schema.methods.addItem = function (House, Item) {
    this.items.push(Item);
    House.update({$set: {'items':House.items}}, function (err, res) {
        if (err) {
            console.log('there was an error in updating house with item');
            console.log(err);
            return;
        }
        console.log('House was successfully updated with a new item');
    });
}

schema.methods.addLoc = function (house, location) {
    this.locations.push(location);
    house.update({$set: {'locations':house.locations}}, function (err, res){
        if (err) {
            return console.log('Failed to update location');
        }
        console.log("succes in addLoc");
    });
}


module.exports = mongoose.model('HouseHold', schema);


