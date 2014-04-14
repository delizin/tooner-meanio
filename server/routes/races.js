'use strict';

// races routes use races controller
var races = require('../controllers/races');
  
module.exports = function(app) {

  app.get('/races', races.all);
  app.get('/races/:raceId', races.show);

  // Finish with setting up the raceId param
  app.param('raceId', races.race);

};
