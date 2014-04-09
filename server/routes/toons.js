'use strict';

// Toons routes use toons controller
var toons = require('../controllers/toons');
var authorization = require('./middlewares/authorization');

// Toon authorization helpers
var hasAuthorization = function(req, res, next) {
	if (req.toon.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {

    app.get('/toons', toons.all);
    app.post('/toons', authorization.requiresLogin, toons.create);
    app.get('/toons/:toonId', toons.show);
    app.put('/toons/:toonId', authorization.requiresLogin, hasAuthorization, toons.update);
    app.del('/toons/:toonId', authorization.requiresLogin, hasAuthorization, toons.destroy);

    // Finish with setting up the toonId param
    app.param('toonId', toons.toon);

};
