'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IntercomSchema = new Schema({
  alldata: Object,
  last_updated: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Intercom', IntercomSchema);
