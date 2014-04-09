'use strict';

//Toons service used for toons REST endpoint
angular.module('mean.toons').factory('Toons', ['$resource', function($resource) {
    return $resource('toons/:toonId', {
        toonId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
