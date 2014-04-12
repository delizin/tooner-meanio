'use strict';

// traits routes use traits controller
var traits = require('../controllers/traits');
  
module.exports = function(app) {

  app.get('/traits', traits.all);
  app.get('/traits/:traitId', traits.show);

  // Finish with setting up the traitId param
  app.param('traitId', traits.trait);

};
