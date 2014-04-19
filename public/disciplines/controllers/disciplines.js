'use strict';

angular.module('mean.disciplines').controller('DisciplinesController', ['$scope', '$stateParams', '$location', 'Global', 'Disciplines',
  function($scope, $stateParams, $location, Global, Disciplines) {
    $scope.global = Global;

    $scope.find = function() {
      Disciplines.query(function(disciplines) {
        $scope.disciplines = disciplines;
      });
    };

    $scope.findOne = function() {
      Disciplines.get({
        disciplineId: $stateParams.disciplineId
      }, function(discipline) {
        $scope.discipline = discipline;
      });
    };
  }
]);
