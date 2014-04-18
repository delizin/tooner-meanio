'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Prestige Schema
 */
var PrestigeSchema = new Schema({
  name: {
    type: String,
    default: '',
    trim: true
  },
  availableBaseClasses: {
    type: Array,
    default: []
  },
  availableRaces: {
    type: Array,
    default: []
  },
  availableDisciplines: {
    type: Array,
    default: []
  },
  availableMasteries: {
    type: Array,
    default: []
  },
});

/**
 * Statics
 */
PrestigeSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Prestige', PrestigeSchema);
