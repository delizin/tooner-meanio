'use strict';

//StatRunes service used for statRunes REST endpoint
angular.module('mean.statRunes').factory('StatRunes', ['$resource', function($resource) {
    return $resource('statRunes/:statRuneId', {
        statRuneId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
