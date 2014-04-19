'use strict';

angular.module('mean.statRunes').controller('StatRunesController', ['$scope', '$stateParams', '$location', 'Global', 'StatRunes',
  function($scope, $stateParams, $location, Global, StatRunes) {
    $scope.global = Global;

    $scope.find = function() {
      StatRunes.query(function(statRunes) {
        $scope.statRunes = statRunes;
      });
    };

    $scope.findOne = function() {
      StatRunes.get({
        statRuneId: $stateParams.statRuneId
      }, function(statRune) {
        $scope.statRune = statRune;
      });
    };
  }
]);
