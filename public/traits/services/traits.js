'use strict';

//Traits service used for traits REST endpoint
angular.module('mean.traits').factory('Traits', ['$resource', function($resource) {
    return $resource('traits/:traitId', {
        traitId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
