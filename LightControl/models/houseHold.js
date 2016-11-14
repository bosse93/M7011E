module.exports = function houseHold(oldHouse){
    this.items = houseHold.items || {};
    this.totalQty = houseHold.totalQty || 0;
    this.totalPower = houseHold.totalPower || 0;


    this.add = function(item, id) {
        var storedItem = this.items[id];
        if(!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, power: 0};
        }
        storedItem.qty++;
        storedItem.power = storedItem.item.power * storedItem.qty;
        this.totalQty++;
        this.totalPower += storedItem.item.power;
    };

    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};