'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Discipline = mongoose.model('Discipline');


/**
 * Find discipline by id
 */
exports.discipline = function(req, res, next, id) {
  Discipline.load(id, function(err, discipline) {
    if (err) return next(err);
    if (!discipline) return next(new Error('Failed to load discipline ' + id));
    req.discipline = discipline;
    next();
  });
};

/**
 * Show a discipline
 */
exports.show = function(req, res) {
  res.jsonp(req.discipline);
};

/**
 * List of disciplines
 */
exports.all = function(req, res) {
  Discipline.find().sort('-created').exec(function(err, disciplines) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(disciplines);
    }
  });
};
