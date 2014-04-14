'use strict';

//Races service used for races REST endpoint
angular.module('mean.races').factory('Races', ['$resource', function($resource) {
    return $resource('races/:raceId', {
        raceId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
