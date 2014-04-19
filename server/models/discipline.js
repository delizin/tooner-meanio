'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Discipline Schema
 */
var DisciplineSchema = new Schema({
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
  availablePrestigeClasses: {
    type: Array,
    default: []
  },
  disciplinesProhibited: {
    type: Array,
    default: []
  }
});

/**
 * Statics
 */
DisciplineSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Discipline', DisciplineSchema);
