const mongoose = require("mongoose");
const playerScehma = require("./player");

const roomSchema = mongoose.Schema({
  occupancy: {
    type: Number,
    default: 2,
  },
  maxRounds: {
    type: Number,
    default: 6,
  },
  currentRound: {
    required: true,
    type: Number,
    default: 1,
  },
  players: [playerScehma],
  isJoin: {
    type: Boolean,
    default: true,
  },
  turn: playerScehma,
  turnIndex: {
    type: Number,
    default: 0,
  },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
