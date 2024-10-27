const mongoose = require("mongoose");

const Rooms = new mongoose.Schema(
  {
    room_name: {
      type: String,
      required: true,
    },
    room_description: {
      type: String,
      required: true,
    },
    People: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Rooms", Rooms);
