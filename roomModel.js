const mongoose = require("mongoose");
const { Schema } = require("mongoose");

mongoose.Promise = global.Promise;

const roomSchema = new Schema({
  googleDoc: { type: String, default: "" },
  roomUrl: { type: String, default: "" },
});


const RoomModel = mongoose.model("Users", roomSchema);

module.exports = RoomModel;
