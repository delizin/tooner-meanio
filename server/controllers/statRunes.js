'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  StatRune = mongoose.model('StatRune');


/**
 * Find statRune by id
 */
exports.statRune = function(req, res, next, id) {
  StatRune.load(id, function(err, statRune) {
    if (err) return next(err);
    if (!statRune) return next(new Error('Failed to load statRune ' + id));
    req.statRune = statRune;
    next();
  });
};

/**
 * Show a statRune
 */
exports.show = function(req, res) {
  res.jsonp(req.statRune);
};

/**
 * List of statRunes
 */
exports.all = function(req, res) {
  StatRune.find().sort({category: 1, cost: 1}).exec(function(err, statRunes) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(statRunes);
    }
  });
};
