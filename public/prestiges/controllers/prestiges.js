'use strict';

angular.module('mean.prestiges').controller('PrestigesController', ['$scope', '$stateParams', '$location', 'Global', 'Prestiges',
  function($scope, $stateParams, $location, Global, Prestiges) {
    $scope.global = Global;

    $scope.find = function() {
      Prestiges.query(function(prestiges) {
        $scope.prestiges = prestiges;
      });
    };

    $scope.findOne = function() {
      Prestiges.get({
        prestigeId: $stateParams.prestigeId
      }, function(prestige) {
        $scope.prestige = prestige;
      });
    };
  }
]);
