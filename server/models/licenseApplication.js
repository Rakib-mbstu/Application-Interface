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
});

module.exports = mongoose.model("license", licenseSchema);
