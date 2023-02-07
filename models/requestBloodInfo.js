const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestBloodInfoSchema = new Schema({
  receiversID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  hospitalID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  bloodID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("ReqBloodInfo", requestBloodInfoSchema);
