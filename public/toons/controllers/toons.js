'use strict';

angular.module('mean.toons').controller('ToonsController', ['$scope', '$stateParams', '$location', 'Global', 'growl', 'Races', 'Traits', 'Toons',
  function($scope, $stateParams, $location, Global, growl, Races, Traits, Toons) {
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
      $scope.selectedRace = null;
      $scope.selectedTraitCategories = [];
      $scope.hideUnavailable = true;
      $scope.toonLevel = 1;

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

    $scope.masteryRunes = ["Master of Axes", "Master of Daggers", "Master of Great Axes", "Master of Great Hammers", "Master of Great Swords", "Master of Hammers", "Master of Pole Arms", "Master of Spears", "Master of Staves", "Master of Swords", "Master of Throwing"]


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

      Races.query(function(races) {
        $scope.races = races;
      });
    };

    $scope.changeToonLevel = function(num) {
      $scope.toonLevel = num;
    }

    $scope.chooseRace = function(race) {
      //First remove the currently selected race's stats
      if ($scope.selectedRace) {
        $scope.remainingPoints += $scope.selectedRace.cost;
        
        changeBaseStats('strength', $scope.selectedRace.grantedBaseStr * -1);
        changeBaseStats('dexterity', $scope.selectedRace.grantedBaseDex * -1);
        changeBaseStats('constitution', $scope.selectedRace.grantedBaseCon * -1);
        changeBaseStats('intelligence', $scope.selectedRace.grantedBaseInt * -1);
        changeBaseStats('spirit', $scope.selectedRace.grantedBaseSpi * -1);

        changeMaxStats('strength', $scope.selectedRace.grantedMaxStr * -1);
        changeMaxStats('dexterity', $scope.selectedRace.grantedMaxDex * -1);
        changeMaxStats('constitution', $scope.selectedRace.grantedMaxCon * -1);
        changeMaxStats('intelligence', $scope.selectedRace.grantedMaxInt * -1);
        changeMaxStats('spirit', $scope.selectedRace.grantedMaxSpi * -1);
      }

      //Then deselect all traits before switching
      deselectAllTraits();

      //Then refund stat points
      refundStatPoints();

      //If race is already select then deselect it
      if (race === $scope.selectedRace) {
        $scope.selectedRace = null;
        $scope.chooseBaseClass($scope.selectedBaseClass);
      //Else select the race and apply stat changes
      } else {
        if (race.cost <= $scope.remainingPoints) {
          $scope.selectedRace = race;
          $scope.remainingPoints -= race.cost;

          changeBaseStats('strength', race.grantedBaseStr);
          changeBaseStats('dexterity', race.grantedBaseDex);
          changeBaseStats('constitution', race.grantedBaseCon);
          changeBaseStats('intelligence', race.grantedBaseInt);
          changeBaseStats('spirit', race.grantedBaseSpi);

          changeMaxStats('strength', race.grantedMaxStr);
          changeMaxStats('dexterity', race.grantedMaxDex);
          changeMaxStats('constitution', race.grantedMaxCon);
          changeMaxStats('intelligence', race.grantedMaxInt);
          changeMaxStats('spirit', race.grantedMaxSpi);
        } else {
          growl.addWarnMessage("Not enough points to select this race", {ttl: 5000});
        }
        
      }

      //Race is selected, get available base classes and verify currently selected base class
      getAvailableBaseClasses();
      //If the selected base class is not available to the newly selected race then deselect the base class
      if ($scope.selectedBaseClass && !$scope.selectedBaseClass.available) {
        $scope.chooseBaseClass($scope.selectedBaseClass);
      }
      //Refresh available traits after new race is selected
      getAvailableTraits();
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

      deselectAllTraits();

      if (baseClass === $scope.selectedBaseClass) {
        $scope.selectedBaseClass = null;
      } else {
        if (baseClass.available) {
          $scope.selectedBaseClass = baseClass;

          changeBaseStats('strength', baseClass.grantedBaseStr);
          changeBaseStats('dexterity', baseClass.grantedBaseDex);
          changeBaseStats('constitution', baseClass.grantedBaseCon);
          changeBaseStats('intelligence', baseClass.grantedBaseInt);
          changeBaseStats('spirit', baseClass.grantedBaseSpi);

          getAvailableTraits();
        }
      }
    };

    $scope.selectTrait = function(trait) {
      if (!trait.available) {
        growl.addWarnMessage("Trait not available.", {ttl: 5000});
        return false;
      } else if (trait.categoryRestriction) {
        growl.addWarnMessage(trait.category + " trait already selected.", {ttl: 5000});
        return false;        
      } else if (trait.requirement) {
        growl.addWarnMessage(trait.requirementMessage + " for this trait", {ttl: 5000});
        return false;
      } else {
        if (!trait.selected) {
          if (trait.cost <= $scope.remainingPoints) {
            trait.selected = true;
            $scope.remainingPoints -= trait.cost;

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

            if (trait.category) $scope.selectedTraitCategories.push(trait.category);
          } else {
            growl.addWarnMessage("Not enough points to apply trait", {ttl: 5000});
          }
        } else {
          deselectTrait(trait)
        }

        getAvailableTraits();
      }
    };

    function deselectTrait(trait) {
      trait.selected = false;
      $scope.remainingPoints += trait.cost;

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

      if (trait.category) $scope.selectedTraitCategories.splice($scope.selectedTraitCategories.indexOf(trait.category), 1);
    };

    function deselectAllTraits() {
      $scope.traits.forEach(function(trait) {
        if (trait.selected) deselectTrait(trait);
      });
    }

    function checkStatRequirements(obj) {
      //First check if anything have requirements beyond current stats
      if ($scope.stats.currentStrength < obj.requiredStr) {
        return {status: true, response: "Not enough Strength"};
      } else if ($scope.stats.currentDexterity < obj.requiredDex) {
        return {status: true, response: "Not enough Dexterity"};
      } else if ($scope.stats.currentConstitution < obj.requiredCon) {
        return {status: true, response: "Not enough Constitution"};
      } else if ($scope.stats.currentIntelligence < obj.requiredInt) {
        return {status: true, response: "Not enough Intelligence"};
      } else if ($scope.stats.currentSpirit < obj.requiredSpi) {
        return {status: true, response: "Not enough Spirit"};
      //Then check if we need to remove currently applied rune
      } else if (obj.selected && ($scope.stats.currentStrength - obj.grantedBaseStr) < obj.requiredStr) {
        return {status: true, response: obj.name + " no longer meets Strength requirements and was removed."};
      } else if (obj.selected && ($scope.stats.currentDexterity - obj.grantedBaseDex) < obj.requiredDex) {
        return {status: true, response: obj.name + " no longer meets Dexterity requirements and was removed."};
      } else if (obj.selected && ($scope.stats.currentConstitution - obj.grantedBaseCon) < obj.requiredCon) {
        return {status: true, response: obj.name + " no longer meets Constitution requirements and was removed."};
      } else if (obj.selected && ($scope.stats.currentIntelligence - obj.grantedBaseInt) < obj.requiredInt) {
        return {status: true, response: obj.name + " no longer meets Intelligence requirements and was removed."};
      } else if (obj.selected && ($scope.stats.currentSpirit - obj.grantedBaseSpi) < obj.requiredSpi) {
        return {status: true, response: obj.name + " no longer meets Spirit requirements and was removed."};        
      } else {
        return {status: false};
      }
    };

    function getAvailableBaseClasses() {
      var race = $scope.selectedRace;

      $scope.baseClasses.forEach(function(baseClass) {
        if (race && race.availableBaseClasses.indexOf(baseClass.name) !== -1) {
          baseClass.available = true;
        } else {
          baseClass.available = false;
        }
      });
    };

    function getAvailableTraits() {
      var baseClass = $scope.selectedBaseClass;
      var race = $scope.selectedRace;

      $scope.traits.forEach(function(trait) {
        //If a base class is selected AND the selected base class is an available base class to this trait
        //If a race is selected AND the currently selected race is NOT a prohibited race for this trait
        //If there are no required races for this trait OR 
        //There is at least one required race and the currently selected race is in the required races list
        //WELCOME TO SHADOWBANE
        if (baseClass && trait.availableBaseClasses.indexOf(baseClass.name) !== -1 && 
           (race && trait.prohibitedRaces.indexOf(race.name) === -1) &&
           (trait.requiredRaces.length === 0 || (trait.requiredRaces.length > 0 && trait.requiredRaces.indexOf(race.name) !== -1))) {
          trait.available = true;

          //Oh we also have to check if the trait has minimum stat requirements!
          var requirement = checkStatRequirements(trait);
          if (!requirement.status) {
            trait.requirement = false;
          } else {
            trait.requirement = true;
            trait.requirementMessage = requirement.response;
            if (trait.selected) {
              growl.addWarnMessage(trait.name + " was removed: " + trait.requirementMessage, {ttl: 5000});
              deselectTrait(trait);
            }
          }

          if (checkCategoryRestriction(trait)) {
            trait.categoryRestriction = true;
          } else {
            trait.categoryRestriction = false;
          }

        } else {
          trait.available = false;
          if (trait.selected) deselectTrait(trait);
        }
      });
    }

    function checkCategoryRestriction(trait) {
      //If there are selected traits with categories AND 
      //trait.category is among the selected trait cateogires AND
      //the current trait is NOT the selected one (so it can be deselected)
      if ($scope.selectedTraitCategories.length > 0 && 
          $scope.selectedTraitCategories.indexOf(trait.category) !== -1 && 
          !trait.selected) {
        return true;
      } else {
        return false;
      }
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
        getAvailableTraits();
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
        getAvailableTraits();
      }
    };

    function refundStatPoints() {
      var strDiff = $scope.stats.currentStrength - $scope.stats.baseStrength; 
      $scope.remainingPoints += strDiff;
      $scope.stats.currentStrength -= strDiff;

      var dexDiff = $scope.stats.currentDexterity - $scope.stats.baseDexterity; 
      $scope.remainingPoints += dexDiff;
      $scope.stats.currentDexterity -= dexDiff;

      var conDiff = $scope.stats.currentConstitution - $scope.stats.baseConstitution; 
      $scope.remainingPoints += conDiff;
      $scope.stats.currentConstitution -= conDiff;

      var intDiff = $scope.stats.currentIntelligence - $scope.stats.baseIntelligence; 
      $scope.remainingPoints += intDiff;
      $scope.stats.currentIntelligence -= intDiff;

      var spiDiff = $scope.stats.currentSpirit - $scope.stats.baseSpirit; 
      $scope.remainingPoints += spiDiff;
      $scope.stats.currentSpirit -= spiDiff;
    };

    $scope.getTraitTooltip = function(trait) {
      var tooltip = '<ul class="list-unstyled trait-tooltip">'

      tooltip += "<li>Creation Cost: " + trait.cost + "</li>";

      if (trait.category) tooltip += "<li>Category: " + trait.category;

      if (trait.availableBaseClasses.length < 4) tooltip += "<li>Available: " + trait.availableBaseClasses.join(", "); + "</li>";      

      if (trait.requiredRaces.length > 0) tooltip += "<li>Required: " + trait.requiredRaces.join(", "); + "</li>";
      if (trait.prohibitedRaces.length > 0) tooltip += "<li>Prohibited: " + trait.prohibitedRaces.join(", "); + "</li>";

      if (trait.requiredStr > 0) tooltip += "<li>Required Str: " + trait.requiredStr + "</li>";
      if (trait.requiredDex > 0) tooltip += "<li>Required Dex: " + trait.requiredDex + "</li>";
      if (trait.requiredCon > 0) tooltip += "<li>Required Con: " + trait.requiredCon + "</li>";
      if (trait.requiredInt > 0) tooltip += "<li>Required Int: " + trait.requiredInt + "</li>";
      if (trait.requiredSpi > 0) tooltip += "<li>Required Spi: " + trait.requiredSpi + "</li>";

      if (trait.grantedBaseStr !== 0) tooltip += "<li>Granted Base Str: " + trait.grantedBaseStr + "</li>";
      if (trait.grantedMaxStr !== 0) tooltip += "<li>Granted Max Str: " + trait.grantedMaxStr + "</li>";

      if (trait.grantedBaseDex !== 0) tooltip += "<li>Granted Base Dex: " + trait.grantedBaseDex + "</li>";
      if (trait.grantedMaxDex !== 0) tooltip += "<li>Granted Max Dex: " + trait.grantedMaxDex + "</li>";

      if (trait.grantedBaseCon !== 0) tooltip += "<li>Granted Base Con: " + trait.grantedBaseCon + "</li>";
      if (trait.grantedMaxCon !== 0) tooltip += "<li>Granted Max Con: " + trait.grantedMaxCon + "</li>";

      if (trait.grantedBaseInt !== 0) tooltip += "<li>Granted Base Int: " + trait.grantedBaseInt + "</li>";
      if (trait.grantedMaxInt !== 0) tooltip += "<li>Granted Max Int: " + trait.grantedMaxInt + "</li>";

      if (trait.grantedBaseSpi !== 0) tooltip += "<li>Granted Base Spi: " + trait.grantedBaseSpi + "</li>";
      if (trait.grantedMaxSpi !== 0) tooltip += "<li>Granted Max Spi: " + trait.grantedMaxSpi + "</li>";

      tooltip += '</ul>';

      return tooltip;
    };
  }
]);
