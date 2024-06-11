const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const licenseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  proprietor: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("license", licenseSchema);
