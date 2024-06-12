const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const pathSchema = new Schema({
  mspId: {
    type: String,
    required: true,
  },
  dirName: {
    type: String,
    required: true,
  },
  keyPath: {
    type: String,
    required: true,
  },
  certPath: {
    type: String,
    required: true,
  },
  tlsPath: {
    type: String,
    required: true,
  },
  peerPoint: {
    type: String,
    required: true,
  },
  certPath: {
    type: String,
    required: true,
  },
  peerHost: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("dPath", pathSchema);
