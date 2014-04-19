'use strict';
/**
 *  Mean container for dependency injection
 */
var mean = require('meanio');
mean.app('Tooner',{});

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    passport = require('passport'),
    logger = require('mean-logger');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Initializing system variables
var config = require('./server/config/config');
var db = mongoose.connect(config.db);

// Bootstrap Models, Dependencies, Routes and the app as an express app
var app = require('./server/config/system/bootstrap')(passport, db);

// Start the app by listening on <port>
app.listen(config.port);
console.log('Express app started on port ' + config.port);

// Initializing logger
logger.init(app, passport, mongoose);

//Seed hearthstone cards
mongoose.connection.once('open', function() {
  console.log('Database open');

  if (config.seedData) {
    require('./server/config/seed.js');

    var Trait = mongoose.model('Trait');

    Trait.remove().exec()
    .then(function() { Trait.seed(require('./server/config/assets/starting-traits.json')); });

    var Race = mongoose.model('Race');

    Race.remove().exec()
    .then(function() { Race.seed(require('./server/config/assets/races.json')); });

    var Prestige = mongoose.model('Prestige');

    Prestige.remove().exec()
    .then(function() { Prestige.seed(require('./server/config/assets/prestigeClasses.json')); });

    var Discipline = mongoose.model('Discipline');

    Discipline.remove().exec()
    .then(function() { Discipline.seed(require('./server/config/assets/disciplines.json')); });

    var StatRune = mongoose.model('StatRune');

    StatRune.remove().exec()
    .then(function() { StatRune.seed(require('./server/config/assets/stat-runes.json')); });


    console.log('Finished seeding');
  }
});

// Expose app
exports = module.exports = app;
