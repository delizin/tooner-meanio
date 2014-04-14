'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Race Schema
 */
var RaceSchema = new Schema({
  name: {
    type: String,
    default: '',
    trim: true
  },
  cost: {
    type: Number,
    default: 0
  },
  healthBonus: {
    type: Number,
    default: 0
  },
  manaBonus: {
    type: Number,
    default: 0
  },
  staminaBonus: {
    type: Number,
    default: 0
  },
  grantedBaseStr: {
    type: Number,
    default: 0
  },
  grantedBaseDex: {
    type: Number,
    default: 0
  },
  grantedBaseCon: {
    type: Number,
    default: 0
  },
  grantedBaseInt: {
    type: Number,
    default: 0
  },
  grantedBaseSpi: {
    type: Number,
    default: 0
  },
  grantedMaxStr: {
    type: Number,
    default: 0
  },
  grantedMaxDex: {
    type: Number,
    default: 0
  },
  grantedMaxCon: {
    type: Number,
    default: 0
  },
  grantedMaxInt: {
    type: Number,
    default: 0
  },
  grantedMaxSpi: {
    type: Number,
    default: 0
  },
  availableBaseClasses: {
    type: Array,
    default: []
  },
  availablePrestigeClasses: {
    type: Array,
    default: []
  },
  availableDisciplinesClasses: {
    type: Array,
    default: []
  },
  granted: {
    type: Array,
    default: []
  }
});

/**
 * Statics
 */
RaceSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Race', RaceSchema);
