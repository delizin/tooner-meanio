'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Trait = mongoose.model('Trait');


/**
 * Find trait by id
 */
exports.trait = function(req, res, next, id) {
  Trait.load(id, function(err, trait) {
    if (err) return next(err);
    if (!trait) return next(new Error('Failed to load trait ' + id));
    req.trait = trait;
    next();
  });
};

/**
 * Show a trait
 */
exports.show = function(req, res) {
  res.jsonp(req.trait);
};

/**
 * List of Traits
 */
exports.all = function(req, res) {
  Trait.find().sort('-created').exec(function(err, traits) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(traits);
    }
  });
};
