'use strict';

angular.module('mean.traits').controller('TraitsController', ['$scope', '$stateParams', '$location', 'Global', 'Traits',
  function($scope, $stateParams, $location, Global, Traits) {
    $scope.global = Global;

    $scope.find = function() {
      Traits.query(function(traits) {
        $scope.traits = traits;
      });
    };

    $scope.findOne = function() {
      Traits.get({
        traitId: $stateParams.traitId
      }, function(trait) {
        $scope.trait = trait;
      });
    };
  }
]);
