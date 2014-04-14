'use strict';

angular.module('mean.races').controller('RacesController', ['$scope', '$stateParams', '$location', 'Global', 'Races',
  function($scope, $stateParams, $location, Global, Races) {
    $scope.global = Global;

    $scope.find = function() {
      Races.query(function(races) {
        $scope.races = races;
      });
    };

    $scope.findOne = function() {
      Races.get({
        raceId: $stateParams.raceId
      }, function(race) {
        $scope.race = race;
      });
    };
  }
]);
