'use strict';

angular.module('mean.toons').controller('ToonsController', ['$scope', '$stateParams', '$location', 'Global', 'Traits', 'Toons',
  function($scope, $stateParams, $location, Global, Traits, Toons) {
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
      $scope.selectedBaseClass = null;

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

    $scope.findComponents = function() {
      Traits.query(function(traits) {
        $scope.traits = traits;
      });
    };

    $scope.chooseBaseClass = function(baseClass) {
      //Subtract current stats before applying new class
      if ($scope.selectedBaseClass) {
        changeBaseStats('strength', $scope.selectedBaseClass.grantedBaseStr * -1);
        changeBaseStats('dexterity', $scope.selectedBaseClass.grantedBaseDex * -1);
        changeBaseStats('constitution', $scope.selectedBaseClass.grantedBaseCon * -1);
        changeBaseStats('intelligence', $scope.selectedBaseClass.grantedBaseInt * -1);
        changeBaseStats('spirit', $scope.selectedBaseClass.grantedBaseSpi * -1);
      }
      
      if (baseClass === $scope.selectedBaseClass) {
        $scope.selectedBaseClass = null;
      } else {
        $scope.selectedBaseClass = baseClass;

        changeBaseStats('strength', baseClass.grantedBaseStr);
        changeBaseStats('dexterity', baseClass.grantedBaseDex);
        changeBaseStats('constitution', baseClass.grantedBaseCon);
        changeBaseStats('intelligence', baseClass.grantedBaseInt);
        changeBaseStats('spirit', baseClass.grantedBaseSpi);
      }

      getAvailableTraits();
    };

    function getAvailableTraits() {
      var baseClass = $scope.selectedBaseClass.name;
      //var race = $scope.selectedRace;

      $scope.traits.forEach(function(trait) {
        if (trait.availableBaseClasses.indexOf(baseClass) !== -1) {
          trait.available = true;
        } else {
          trait.available = false;
        }
      });
    }

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

    function changeMaxStats(stat, val) {
      switch (stat) {
        case 'strength':
          $scope.stats.maxStrength += val;
          //If current stat is higher than max then reset it to max and refund the points
          if ($scope.stats.currentStrength > $scope.stats.maxStrength) {
            $scope.remainingPoints += ($scope.stats.currentStrength - $scope.stats.maxStrength);
            $scope.stats.currentStrength = $scope.stats.maxStrength;
          }          
          break;
        case 'dexterity':
          $scope.stats.maxDexterity += val;
          if ($scope.stats.currentDexterity > $scope.stats.maxDexterity) {
            $scope.remainingPoints += ($scope.stats.currentDexterity - $scope.stats.maxDexterity);
            $scope.stats.currentDexterity = $scope.stats.maxDexterity;
          }
          break;
        case 'constitution':
          $scope.stats.maxConstitution += val;
          if ($scope.stats.currentConstitution > $scope.stats.maxConstitution) {
            $scope.remainingPoints += ($scope.stats.currentConstitution - $scope.stats.maxConstitution);
            $scope.stats.currentConstitution = $scope.stats.maxConstitution;
          }
          break;
        case 'intelligence':
          $scope.stats.maxIntelligence += val;
          if ($scope.stats.currentIntelligence > $scope.stats.maxIntelligence) {
            $scope.remainingPoints += ($scope.stats.currentIntelligence - $scope.stats.maxIntelligence);
            $scope.stats.currentIntelligence = $scope.stats.maxIntelligence;
          }
          break;
        case 'spirit':
          $scope.stats.maxSpirit += val;
          if ($scope.stats.currentSpirit > $scope.stats.maxSpirit) {
            $scope.remainingPoints += ($scope.stats.currentSpirit - $scope.stats.maxSpirit);
            $scope.stats.currentSpirit = $scope.stats.maxSpirit;
          }
          break;
        default:
          console.log('Error: tried to increase non-existent max stat');
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

    $scope.selectTrait = function(trait) {
      if (!trait.selected) {
        trait.selected = true;

        changeBaseStats('strength', trait.grantedBaseStr);
        changeBaseStats('dexterity', trait.grantedBaseDex);
        changeBaseStats('constitution', trait.grantedBaseCon);
        changeBaseStats('intelligence', trait.grantedBaseInt);
        changeBaseStats('spirit', trait.grantedBaseSpi);

        changeMaxStats('strength', trait.grantedMaxStr);
        changeMaxStats('dexterity', trait.grantedMaxDex);
        changeMaxStats('constitution', trait.grantedMaxCon);
        changeMaxStats('intelligence', trait.grantedMaxInt);
        changeMaxStats('spirit', trait.grantedMaxSpi);
      } else {
        trait.selected = false;

        changeBaseStats('strength', trait.grantedBaseStr * -1);
        changeBaseStats('dexterity', trait.grantedBaseDex * -1);
        changeBaseStats('constitution', trait.grantedBaseCon * -1);
        changeBaseStats('intelligence', trait.grantedBaseInt * -1);
        changeBaseStats('spirit', trait.grantedBaseSpi * -1);

        changeMaxStats('strength', trait.grantedMaxStr * -1);
        changeMaxStats('dexterity', trait.grantedMaxDex * -1);
        changeMaxStats('constitution', trait.grantedMaxCon * -1);
        changeMaxStats('intelligence', trait.grantedMaxInt * -1);
        changeMaxStats('spirit', trait.grantedMaxSpi * -1);
      }
    };
  }
]);
