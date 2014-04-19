'use strict';

//Disciplines service used for disciplines REST endpoint
angular.module('mean.disciplines').factory('Disciplines', ['$resource', function($resource) {
    return $resource('disciplines/:disciplineId', {
        disciplineId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
