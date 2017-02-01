var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
   local: {
       email: {type: String},
       password: {type: String}
   },
   google: {
       id: String,
       token: String,
       email: String,
       name: String
   },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    fileSchema: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    }
});

var fileSchema = new Schema({
    paths: Array,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

var homeConnect = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ip: {type: String, default: "0.0.0.0"},
    port: {type: String, default: "0000"}
});


userSchema.methods.encryptPassword = function(password) {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(9), null);
};

userSchema.methods.validPassword = function(password) {
   return bcrypt.compareSync(password, this.local.password);
};



//module.exports = mongoose.model('User', userSchema);

var userSchema = mongoose.model('User', userSchema);
var fileSchema = mongoose.model('File', fileSchema);
var homeConnect = mongoose.model('homeUnit', homeConnect);

var Models = {User: userSchema, File: fileSchema, homeUnit: homeConnect};

module.exports = Models;