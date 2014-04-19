'use strict';

// statRunes routes use statRunes controller
var statRunes = require('../controllers/statRunes');
  
module.exports = function(app) {

  app.get('/statRunes', statRunes.all);
  app.get('/statRunes/:statRuneId', statRunes.show);

  // Finish with setting up the statRuneId param
  app.param('statRuneId', statRunes.statRune);

};
