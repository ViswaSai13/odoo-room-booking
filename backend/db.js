const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:yyxBjT1Q6EB6JPD9@clusterexp0.evxmlfi.mongodb.net/room-booking"
);

const roomSchema = new mongoose.Schema({
  name: String,
  seatCapacity: Number,
  facilities: [String],
});

const bookingSchema = new mongoose.Schema({
  roomId: String,
  date: String,
  slot: Number,
  userId: String,
});

const Room = mongoose.model("Room", roomSchema);
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = {
  Room,
  Booking,
};
