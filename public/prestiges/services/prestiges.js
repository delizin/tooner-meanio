'use strict';

//Prestiges service used for prestiges REST endpoint
angular.module('mean.prestiges').factory('Prestiges', ['$resource', function($resource) {
    return $resource('prestiges/:prestigeId', {
        prestigeId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
