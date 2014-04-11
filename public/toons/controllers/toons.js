'use strict';

angular.module('mean.toons').controller('ToonsController', ['$scope', '$stateParams', '$location', 'Global', 'Toons', function ($scope, $stateParams, $location, Global, Toons) {
    $scope.global = Global;
    $scope.stats = {
      baseStrength: 35,
      baseDexterity: 35,
      baseConstitution: 35,
      baseIntelligence: 35,
      baseSpirit: 35,
      maxStrength: 100,
      maxDexterity: 100,
      maxConstitution: 100,
      maxIntelligence: 100,
      maxSpirit: 100,
      currentStrength: 35,
      currentDexterity: 35,
      currentConstitution: 35,
      currentIntelligence: 35,
      currentSpirit: 35
    }

    $scope.create = function() {
        var toon = new Toons({
            title: this.title,
            content: this.content
        });
        toon.$save(function(response) {
            $location.path('toons/' + response._id);
        });

        this.title = '';
        this.content = '';                
    };

    $scope.remove = function(toon) {
        if (toon) {
            toon.$remove();

            for (var i in $scope.toons) {
                if ($scope.toons[i] === toon) {
                    $scope.toons.splice(i, 1);
                }
            }
        }
        else {
            $scope.toon.$remove();
            $location.path('toons');
        }
    };

    $scope.update = function() {
        var toon = $scope.toon;
        if (!toon.updated) {
            toon.updated = [];
        }
        toon.updated.push(new Date().getTime());

        toon.$update(function() {
            $location.path('toons/' + toon._id);
        });
    };

    $scope.find = function() {
        Toons.query(function(toons) {
            $scope.toons = toons;
        });
    };

    $scope.findOne = function() {
        Toons.get({
            toonId: $stateParams.toonId
        }, function(toon) {
            $scope.toon = toon;
        });
    };

    $scope.increaseStat = function(stat, val) {
      switch(stat) {
        case "strength":
          if ($scope.stats.currentStrength + val <= $scope.stats.maxStrength) $scope.stats.currentStrength += val;
          break;
        case "dexterity":
          if ($scope.stats.currentDexterity + val <= $scope.stats.maxDexterity) $scope.stats.currentDexterity += val;
          break;
        case "constitution":
          if ($scope.stats.currentConstitution + val <= $scope.stats.maxConstitution) $scope.stats.currentConstitution += val;
          break;
        case "intelligence":
          if ($scope.stats.currentIntelligence + val <= $scope.stats.maxIntelligence) $scope.stats.currentIntelligence += val;
          break;
        case "spirit":
          if ($scope.stats.currentSpirit + val <= $scope.stats.maxSpirit) $scope.stats.currentSpirit += val;
          break;
        default:
          console.log("Error: tried to increase non-existent stat");
      }
    };

    $scope.decreaseStat = function(stat, val) {
      switch(stat) {
        case "strength":
          if ($scope.stats.currentStrength - val >= $scope.stats.baseStrength) $scope.stats.currentStrength -= val;
          break;
        case "dexterity":
          if ($scope.stats.currentDexterity + val <= $scope.stats.maxDexterity) $scope.stats.currentDexterity -= val;
          break;
        case "constitution":
          if ($scope.stats.currentConstitution + val <= $scope.stats.maxConstitution) $scope.stats.currentConstitution -= val;
          break;
        case "intelligence":
          if ($scope.stats.currentIntelligence + val <= $scope.stats.maxIntelligence) $scope.stats.currentIntelligence -= val;
          break;
        case "spirit":
          if ($scope.stats.currentSpirit + val <= $scope.stats.maxSpirit) $scope.stats.currentSpirit -= val;
          break;
        default:
          console.log("Error: tried to increase non-existent stat");
      }  
    };
}]);
