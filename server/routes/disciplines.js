'use strict';

// disciplines routes use disciplines controller
var disciplines = require('../controllers/disciplines');
  
module.exports = function(app) {

  app.get('/disciplines', disciplines.all);
  app.get('/disciplines/:disciplineId', disciplines.show);

  // Finish with setting up the disciplineId param
  app.param('disciplineId', disciplines.discipline);

};
