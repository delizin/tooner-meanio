'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Race = mongoose.model('Race');


/**
 * Find race by id
 */
exports.race = function(req, res, next, id) {
  Race.load(id, function(err, race) {
    if (err) return next(err);
    if (!race) return next(new Error('Failed to load race ' + id));
    req.race = race;
    next();
  });
};

/**
 * Show a race
 */
exports.show = function(req, res) {
  res.jsonp(req.race);
};

/**
 * List of races
 */
exports.all = function(req, res) {
  Race.find().sort('-created').exec(function(err, races) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(races);
    }
  });
};
