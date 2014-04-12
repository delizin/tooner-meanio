'use strict';

angular.module('mean.toons').controller('ToonsController', ['$scope', '$stateParams', '$location', 'Global', 'Toons',
  function($scope, $stateParams, $location, Global, Toons) {
    $scope.global = Global;
    init();

    function init() {
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

      $scope.remainingPoints = $scope.maxPoints = 55;
      $scope.selectedClass = null;

      $scope.baseClasses = [{
        'name': 'Fighter',
        'grantedBaseStr': 5,
        'grantedBaseDex': 0,
        'grantedBaseCon': 5,
        'grantedBaseInt': -10,
        'grantedBaseSpi': 0
      }, {
        'name': 'Healer',
        'grantedBaseStr': 0,
        'grantedBaseDex': -10,
        'grantedBaseCon': 5,
        'grantedBaseInt': 0,
        'grantedBaseSpi': 5
      }, {
        'name': 'Rogue',
        'grantedBaseStr': 0,
        'grantedBaseDex': 5,
        'grantedBaseCon': 0,
        'grantedBaseInt': 5,
        'grantedBaseSpi': -10
      }, {
        'name': 'Mage',
        'grantedBaseStr': -10,
        'grantedBaseDex': 0,
        'grantedBaseCon': 0,
        'grantedBaseInt': 5,
        'grantedBaseSpi': 5
      }]
    };

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
      } else {
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

    $scope.chooseBaseClass = function(baseClass) {
      //Subtract current stats before applying new class
      if ($scope.selectedClass) {
        changeBaseStats('strength', $scope.selectedClass.grantedBaseStr * -1)
        changeBaseStats('dexterity', $scope.selectedClass.grantedBaseDex * -1)
        changeBaseStats('constitution', $scope.selectedClass.grantedBaseCon * -1)
        changeBaseStats('intelligence', $scope.selectedClass.grantedBaseInt * -1)
        changeBaseStats('spirit', $scope.selectedClass.grantedBaseSpi * -1)  
      }
      
      if (baseClass === $scope.selectedClass) {
        $scope.selectedClass = null;
      } else {
        $scope.selectedClass = baseClass;

        changeBaseStats('strength', baseClass.grantedBaseStr)
        changeBaseStats('dexterity', baseClass.grantedBaseDex)
        changeBaseStats('constitution', baseClass.grantedBaseCon)
        changeBaseStats('intelligence', baseClass.grantedBaseInt)
        changeBaseStats('spirit', baseClass.grantedBaseSpi)
      }
    };

    function changeBaseStats(stat, val) {
      switch (stat) {
        case 'strength':
          $scope.stats.baseStrength += val;
          $scope.stats.currentStrength += val;
          break;
        case 'dexterity':
          $scope.stats.baseDexterity += val;
          $scope.stats.currentDexterity += val;
          break;
        case 'constitution':
          $scope.stats.baseConstitution += val;
          $scope.stats.currentConstitution += val;
          break;
        case 'intelligence':
          $scope.stats.baseIntelligence += val;
          $scope.stats.currentIntelligence += val;
          break;
        case 'spirit':
          $scope.stats.baseSpirit += val;
          $scope.stats.currentSpirit += val;
          break;
        default:
          console.log('Error: tried to increase non-existent base stat');
      }
    };

    $scope.increaseStat = function(stat) {
      if ($scope.remainingPoints > 0) {
        switch (stat) {
          case 'strength':
            if ($scope.stats.currentStrength < $scope.stats.maxStrength) {
              $scope.stats.currentStrength += 1;
              $scope.remainingPoints -= 1;
            }
            break;
          case 'dexterity':
            if ($scope.stats.currentDexterity < $scope.stats.maxDexterity) {
              $scope.stats.currentDexterity += 1;
              $scope.remainingPoints -= 1;
            }
            break;
          case 'constitution':
            if ($scope.stats.currentConstitution < $scope.stats.maxConstitution) {
              $scope.stats.currentConstitution += 1;
              $scope.remainingPoints -= 1;
            }
            break;
          case 'intelligence':
            if ($scope.stats.currentIntelligence < $scope.stats.maxIntelligence) {
              $scope.stats.currentIntelligence += 1;
              $scope.remainingPoints -= 1; 
            }
            break;
          case 'spirit':
            if ($scope.stats.currentSpirit < $scope.stats.maxSpirit) {
              $scope.stats.currentSpirit += 1;
              $scope.remainingPoints -= 1;
            }
            break;
          default:
            console.log('Error: tried to increase non-existent stat');
        }
      }
    };

    $scope.decreaseStat = function(stat) {
      if ($scope.remainingPoints < $scope.maxPoints) {
        switch (stat) {
          case 'strength':
            if ($scope.stats.currentStrength > $scope.stats.baseStrength) {
              $scope.stats.currentStrength -= 1;
              $scope.remainingPoints += 1;
            }
            break;
          case 'dexterity':
            if ($scope.stats.currentDexterity > $scope.stats.baseDexterity) {
              $scope.stats.currentDexterity -= 1;
              $scope.remainingPoints += 1;
            }
            break;
          case 'constitution':
            if ($scope.stats.currentConstitution > $scope.stats.baseConstitution) {
              $scope.stats.currentConstitution -= 1;
              $scope.remainingPoints += 1;
            }
            break;
          case 'intelligence':
            if ($scope.stats.currentIntelligence > $scope.stats.baseIntelligence) {
              $scope.stats.currentIntelligence -= 1;
              $scope.remainingPoints += 1;
            }
            break;
          case 'spirit':
            if ($scope.stats.currentSpirit > $scope.stats.baseSpirit) {
              $scope.stats.currentSpirit -= 1;
              $scope.remainingPoints += 1;
            }
            break;
          default:
            console.log('Error: tried to decrease non-existent stat');
        }
      }
    };
  }
]);
