'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Toon Schema
 */
var ToonSchema = new Schema({
    created: {
      type: Date,
      default: Date.now
    },
    title: {
      type: String,
      default: '',
      trim: true
    },
    content: {
      type: String,
      default: '',
      trim: true
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    startingStatPoints: {
      type: Number,
      default: 55
    },
    endingStatPoints: {
      type: Number,
      default: 205
    },
    trainingPoints: {
      type: Number,
      default: -1
    },
    race: {
      type: String,
      default: "human"
    },
    baseClass: {
      type: String,
      default: ""
    },
    prestigeClass: {
      type: String,
      default: ""
    },
    startingTraits: {
      type: Array,
    },
    disciplines: {
      type: Array,
    },
    statRunes: {
      type: Array,
    },
    masteryRunes: {
      type: Array,
    },
    stats: {
      type: Object,
      default: {
        baseStrength: 35,
        baseDexterity: 35,
        baseConstitution: 35,
        baseIntelligence: 35,
        baseSpirit: 35,
        maxStrength: 100,
        maxDexterity: 100,
        maxConstitution: 100,
        maxIntelligence: 100,
        maxSpirit: 100,
        currentStrength: 35,
        currentDexterity: 35,
        currentConstitution: 35,
        currentIntelligence: 35,
        currentSpirit: 35
      }
    },
});

/**
 * Validations
 */
ToonSchema.path('title').validate(function(title) {
  return title.length;
}, 'Title cannot be blank');

/**
 * Statics
 */
ToonSchema.statics.load = function(id, cb) {
  this.findOne({
      _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Toon', ToonSchema);
