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

    $scope.changeStat = function(stat, current, base, max) {
      switch(stat) {
        case "strength":
          $scope.stats.currentStrength += current || 0;
          $scope.stats.baseStrength += base || 0;
          $scope.stats.maxStrength += max || 0;
          break;
        case "dexterity":
          $scope.stats.currentDexterity += current || 0;
          $scope.stats.baseDexterity += base || 0;
          $scope.stats.maxDexterity += max || 0;
          break;
        case "constitution":
          $scope.stats.currentConstitution += current || 0;
          $scope.stats.baseConstitution += base || 0;
          $scope.stats.maxConstitution += max || 0;
          break;
        case "intelligence":
          $scope.stats.currentIntelligence += current || 0;
          $scope.stats.baseIntelligence += base || 0;
          $scope.stats.maxIntelligence += max || 0;
          break;
        case "spirit":
          $scope.stats.currentSpirit += current || 0;
          $scope.stats.baseSpirit += base || 0;
          $scope.stats.maxSpirit += max || 0;
          break;
        default:
          console.log("Error: tried to change non-existent stat");
    }
  }
}]);
