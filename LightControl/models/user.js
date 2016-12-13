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


userSchema.methods.encryptPassword = function(password) {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(9), null);
};

userSchema.methods.validPassword = function(password) {
   return bcrypt.compareSync(password, this.local.password);
};



//module.exports = mongoose.model('User', userSchema);

var userSchema = mongoose.model('User', userSchema);
var fileSchema = mongoose.model('File', fileSchema);

var Models = {User: userSchema, File: fileSchema};

module.exports = Models;