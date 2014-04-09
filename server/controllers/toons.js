'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Toon = mongoose.model('Toon'),
    _ = require('lodash');


/**
 * Find toon by id
 */
exports.toon = function(req, res, next, id) {
    Toon.load(id, function(err, toon) {
        if (err) return next(err);
        if (!toon) return next(new Error('Failed to load toon ' + id));
        req.toon = toon;
        next();
    });
};

/**
 * Create a toon
 */
exports.create = function(req, res) {
    var toon = new Toon(req.body);
    toon.user = req.user;

    toon.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                toon: toon
            });
        } else {
            res.jsonp(toon);
        }
    });
};

/**
 * Update a toon
 */
exports.update = function(req, res) {
    var toon = req.toon;

    toon = _.extend(toon, req.body);

    toon.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                toon: toon
            });
        } else {
            res.jsonp(toon);
        }
    });
};

/**
 * Delete a toon
 */
exports.destroy = function(req, res) {
    var toon = req.toon;

    toon.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                toon: toon
            });
        } else {
            res.jsonp(toon);
        }
    });
};

/**
 * Show a toon
 */
exports.show = function(req, res) {
    res.jsonp(req.toon);
};

/**
 * List of Toons
 */
exports.all = function(req, res) {
    Toon.find().sort('-created').populate('user', 'name username').exec(function(err, toons) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(toons);
        }
    });
};
