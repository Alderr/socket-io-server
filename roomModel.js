const mongoose = require("mongoose");
const { Schema } = require("mongoose");

mongoose.Promise = global.Promise;

const roomSchema = new Schema({
  members: [{ type: String, required: true }],
  googleDoc: { type: String, default: '' },
});


const RoomModel = mongoose.model("Users", roomSchema);

module.exports = RoomModel;
