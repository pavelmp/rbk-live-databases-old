const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String
});

const placeSchema = new Schema({
    location: {type: String, required: true},
    distance: {type: Number, required: false},
    user_id: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports.User = mongoose.model('User', userSchema);
module.exports.Place = mongoose.model('Place', placeSchema);
