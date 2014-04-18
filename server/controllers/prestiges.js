'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Prestige = mongoose.model('Prestige');


/**
 * Find prestige by id
 */
exports.prestige = function(req, res, next, id) {
  Prestige.load(id, function(err, prestige) {
    if (err) return next(err);
    if (!prestige) return next(new Error('Failed to load prestige ' + id));
    req.prestige = prestige;
    next();
  });
};

/**
 * Show a prestige
 */
exports.show = function(req, res) {
  res.jsonp(req.prestige);
};

/**
 * List of prestiges
 */
exports.all = function(req, res) {
  Prestige.find().sort('-created').exec(function(err, prestiges) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(prestiges);
    }
  });
};
