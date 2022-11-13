const mongoose = require("mongoose");

const { Schema } = mongoose;

// User model
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  locationData: {
    type: [Object],
    default: []
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  image: {
    type: String,
    require: true
  },
  password: {
    type: String,
    required: true
  },
  registeredAt: {
    type: String,
    required: true
  },
  timestamp: Number
});

module.exports = mongoose.model("User", UserSchema);
