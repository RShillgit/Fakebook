const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    /*
    username: {type: String, required: true},
    hash: {type: String, required: true},
    salt : {type: String, required: true}
    */
   fbID: {type: String},
   name: {type: String},
   email: {type: String}
   // friends : [{}],
   // posts" [{}],
})

// Export model
module.exports = mongoose.model("User", UserSchema);