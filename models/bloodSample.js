const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bloodSampleInfoSchema = new Schema({
  donorName: {
    type: String,
    required: true,
  },
  donorAge: {
    type: Number,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  hospitalID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = mongoose.model("BloodSampleInfo", bloodSampleInfoSchema);
