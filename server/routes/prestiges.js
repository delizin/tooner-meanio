'use strict';

// prestiges routes use prestiges controller
var prestiges = require('../controllers/prestiges');
  
module.exports = function(app) {

  app.get('/prestiges', prestiges.all);
  app.get('/prestiges/:prestigeId', prestiges.show);

  // Finish with setting up the prestigeId param
  app.param('prestigeId', prestiges.prestige);

};
