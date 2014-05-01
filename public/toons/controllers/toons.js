'use strict';

angular.module('mean.toons').controller('ToonsController', ['$scope', '$stateParams', '$location', 'Global', 'growl', 'Races', 'Traits', 'Disciplines', 'StatRunes', 'Prestiges', 'Toons',
  function($scope, $stateParams, $location, Global, growl, Races, Traits, Disciplines, StatRunes, Prestiges, Toons) {
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
      $scope.selectedPrestigeClass = null;
      $scope.selectedTraitCategories = [];
      $scope.selectedStatRuneCategories = [];
      $scope.prohibitedDisciplines = [];
      $scope.selectedTraits = [];
      $scope.selectedDisciplines = [];
      $scope.selectedMasteries = [];
      $scope.selectedStatRunes = [];
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
      }];

        $scope.masteries = [{
          'name': 'Master of Axes',
          'cost': 5
        }, {
          'name': 'Master of Daggers',
          'cost': 5
        }, {
          'name': 'Master of Great Axes',
          'cost': 5
        }, {
          'name': 'Master of Great Hammers',
          'cost': 5
        }, {
          'name': 'Master of Great Swords',
          'cost': 5
        }, {
          'name': 'Master of Hammers',
          'cost': 5
        }, {
          'name': 'Master of Pole Arms',
          'cost': 5
        }, {
          'name': 'Master of Spears',
          'cost': 5
        }, {
          'name': 'Master of Staves',
          'cost': 5
        }, {
          'name': 'Master of Swords',
          'cost': 5
        }, {
          'name': 'Master of Throwing',
          'cost': 5
        }
      ];
    };

    $scope.create = function() {
      var toon = new Toons({
        buildTitle: this.buildTitle,
        buildNotes: this.buildNotes,
        stats: $scope.stats,
        selectedRace: $scope.selectedRace,
        selectedBaseClass: $scope.selectedBaseClass,
        selectedPrestigeClass: $scope.selectedPrestigeClass,
        selectedTraits: $scope.selectedTraits,
        selectedDisciplines: $scope.selectedDisciplines,
        selectedMasteries: $scope.selectedMasteries,
        selectedStatRunes: $scope.selectedStatRunes,
        remainingPoints: $scope.remainingPoints
      });

      toon.$save(function(response) {
        $location.path('toons/' + response._id);
      });
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

      Prestiges.query(function(prestigeClasses) {
        $scope.prestigeClasses = prestigeClasses;
      });

      StatRunes.query(function(statRunes) {
        $scope.statRunes = statRunes;
      });

      Disciplines.query(function(disciplines) {
        $scope.disciplines = disciplines;
      });      
    };

    $scope.chooseMinLevel = function() {
      if ($scope.toonLevel !== 1) {
        $scope.toonLevel = 1;
        $scope.remainingPoints -= 205;
        $scope.maxPoints -= 205;

        unchoosePrestigeClass();
        refundStatPoints();  
      }
    };

    $scope.chooseMaxLevel = function() {
      if ($scope.toonLevel !== 75) {
        $scope.toonLevel = 75;
        $scope.remainingPoints += 205;
        $scope.maxPoints += 205;

        getAvailablePrestigeClasses();  
      }
    };

    $scope.resetToon = function() {
      if ($scope.toonLevel === 75)$scope.chooseMinLevel();
      if ($scope.selectedRace) $scope.chooseRace($scope.selectedRace);
      $scope.buildTitle = "";
      $scope.buildNotes = "";
    };

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
            $scope.selectedTraits.push(trait);
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

    //TODO: Minimum stat requirement to apply rune
    //TODO: Remove stat runes if stats are manually lowered
    $scope.selectStatRune = function(statRune) {
      if (statRune.requirement) {
        growl.addWarnMessage(statRune.requirementMessage + " for " + statRune.name, {ttl: 5000});
        return false;
      }
      if (!statRune.selected) {
        //Check if we have a rune of this category already selected
        if ($scope.selectedStatRuneCategories.indexOf(statRune.category) !== -1) {
          var selectedStatRune;
          //Find the stat rune of the current category that is already selected so we can replace it
          $scope.statRunes.forEach(function(rune) {
            if (rune.selected && rune.category == statRune.category) {
              selectedStatRune = rune;
              return;
            }
          });

          if (statRune.cost <= $scope.remainingPoints + selectedStatRune.cost) {
            applyStatRune(statRune);
            deselectStatRune(selectedStatRune);  
          } else {
            growl.addWarnMessage("Not enough points to apply " + statRune.name + " even after removing " + selectedStatRune.name, {ttl: 5000});
          }
          
        }
        else if (statRune.cost <= $scope.remainingPoints) {
          applyStatRune(statRune);
        } else {
          growl.addWarnMessage("Not enough points to apply " + statRune.name, {ttl: 5000});
        }
      } else {
        deselectStatRune(statRune);
      }

      getAvailableStatRunes();
    };

    function applyStatRune(statRune) {
      statRune.selected = true;
      $scope.selectedStatRunes.push(statRune);
      $scope.remainingPoints -= statRune.cost;

      changeBaseStats('strength', statRune.grantedBaseStr);
      changeBaseStats('dexterity', statRune.grantedBaseDex);
      changeBaseStats('constitution', statRune.grantedBaseCon);
      changeBaseStats('intelligence', statRune.grantedBaseInt);
      changeBaseStats('spirit', statRune.grantedBaseSpi);

      changeMaxStats('strength', statRune.grantedMaxStr);
      changeMaxStats('dexterity', statRune.grantedMaxDex);
      changeMaxStats('constitution', statRune.grantedMaxCon);
      changeMaxStats('intelligence', statRune.grantedMaxInt);
      changeMaxStats('spirit', statRune.grantedMaxSpi);

      $scope.selectedStatRuneCategories.push(statRune.category);
    };

    function deselectStatRune(statRune) {
      statRune.selected = false;
      $scope.selectedStatRunes.splice($scope.selectedStatRunes.indexOf(statRune), 1);
      $scope.remainingPoints += statRune.cost;

      changeBaseStats('strength', statRune.grantedBaseStr * -1);
      changeBaseStats('dexterity', statRune.grantedBaseDex * -1);
      changeBaseStats('constitution', statRune.grantedBaseCon * -1);
      changeBaseStats('intelligence', statRune.grantedBaseInt * -1);
      changeBaseStats('spirit', statRune.grantedBaseSpi * -1);

      changeMaxStats('strength', statRune.grantedMaxStr * -1);
      changeMaxStats('dexterity', statRune.grantedMaxDex * -1);
      changeMaxStats('constitution', statRune.grantedMaxCon * -1);
      changeMaxStats('intelligence', statRune.grantedMaxInt * -1);
      changeMaxStats('spirit', statRune.grantedMaxSpi * -1);

      if (statRune.category) $scope.selectedStatRuneCategories.splice($scope.selectedStatRuneCategories.indexOf(statRune.category), 1);
    };

    function deselectAllStatRunes() {
      $scope.statRunes.forEach(function(statRune) {
        if (statRune.selected) deselectStatRune(statRune);
      });      
    };    

    function deselectTrait(trait) {
      trait.selected = false;
      $scope.selectedTraits.splice($scope.selectedTraits.indexOf(trait), 1);
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

    $scope.choosePrestigeClass = function(prestigeClass) {
      if (prestigeClass !== $scope.selectedPrestigeClass) {
        unchoosePrestigeClass();
        $scope.selectedPrestigeClass = prestigeClass;
        getAvailableRunes();  
      } else {
        unchoosePrestigeClass();
      }
    };

    function unchoosePrestigeClass() {
      $scope.selectedPrestigeClass = null;

      deselectAllDisciplines();
      deselectAllStatRunes();
      deselectAllMasteries();
    };

    $scope.selectDiscipline = function(disc) {
      if (!disc.available) {
        growl.addWarnMessage("Discipline not available", {ttl: 5000});
        return false;
      } else if (disc.prohibited) {
        growl.addWarnMessage("Current selection prohibits you from selecting this discipline", {ttl: 5000});
        return false;        
      } else {
        if(!disc.selected) {
          if ($scope.selectedDisciplines.length < 4) {
            disc.selected = true;
            $scope.selectedDisciplines.push(disc);
            if (disc.disciplinesProhibited.length > 0) $scope.prohibitedDisciplines.push.apply($scope.prohibitedDisciplines, disc.disciplinesProhibited);
          } else {
            growl.addWarnMessage("Can only apply up to 4 disciplines", {ttl: 5000});
          }
        } else {
          deselectDiscipline(disc);
        }
      }

      getAvailableDisciplines();
    };

    function deselectDiscipline(disc) {
      disc.selected = false;
      $scope.selectedDisciplines.splice($scope.selectedDisciplines.indexOf(disc), 1);
      //Go through the prohibited discs for this discipline and remove them from the scope's prohibited list
      if (disc.disciplinesProhibited.length > 0) {
        disc.disciplinesProhibited.forEach(function(prohibitedDisc) {
          var discIndex = $scope.prohibitedDisciplines.indexOf(prohibitedDisc);
          if (discIndex !== -1) $scope.prohibitedDisciplines.splice(discIndex, 1);
        });
      }
    }

    function deselectAllDisciplines() {
      $scope.disciplines.forEach(function(discipline) {
        if (discipline.selected) deselectDiscipline(discipline);
      });
    }    

    $scope.selectMastery = function(mastery) {
      if (!mastery.available) {
        growl.addWarnMessage("Mastery not available.", {ttl: 5000});
        return false;
      } else {
        if(!mastery.selected) {
          if (mastery.cost <= $scope.remainingPoints) {
            mastery.selected = true;
            $scope.selectedMasteries.push(mastery);
            $scope.remainingPoints -= mastery.cost;
          } else {
            growl.addWarnMessage("Not enough points to apply mastery", {ttl: 5000});
          }
          
        } else {
          mastery.selected = false;
          $scope.selectedMasteries.splice($scope.selectedMasteries.indexOf(mastery), 1);
          $scope.remainingPoints += mastery.cost;
        }
      }
    };

    function deselectAllMasteries() {
      $scope.masteries.forEach(function(mastery) {
        if (mastery.selected) {
          mastery.selected = false;
          $scope.selectedMasteries.splice($scope.selectedMasteries.indexOf(mastery), 1);
          $scope.remainingPoints += mastery.cost;
        }
      });
    }   

    function checkStatRequirements(obj, type) {
      //First check if anything have requirements beyond current stats
      if ($scope.stats.currentStrength < obj.requiredStr)
        return {status: true, response: "Not enough Strength"};
      if ($scope.stats.currentDexterity < obj.requiredDex)
        return {status: true, response: "Not enough Dexterity"};
      if ($scope.stats.currentConstitution < obj.requiredCon)
        return {status: true, response: "Not enough Constitution"};
      if ($scope.stats.currentIntelligence < obj.requiredInt)
        return {status: true, response: "Not enough Intelligence"};
      if ($scope.stats.currentSpirit < obj.requiredSpi)
        return {status: true, response: "Not enough Spirit"};

      if (type && type === "trait") {
        if (obj.selected && ($scope.stats.currentStrength - obj.grantedBaseStr) < obj.requiredStr)
          return {status: true, response: obj.name + " no longer meets Strength requirements and was removed."};
        if (obj.selected && ($scope.stats.currentDexterity - obj.grantedBaseDex) < obj.requiredDex)
          return {status: true, response: obj.name + " no longer meets Dexterity requirements and was removed."};
        if (obj.selected && ($scope.stats.currentConstitution - obj.grantedBaseCon) < obj.requiredCon)
          return {status: true, response: obj.name + " no longer meets Constitution requirements and was removed."};
        if (obj.selected && ($scope.stats.currentIntelligence - obj.grantedBaseInt) < obj.requiredInt)
          return {status: true, response: obj.name + " no longer meets Intelligence requirements and was removed."};
        if (obj.selected && ($scope.stats.currentSpirit - obj.grantedBaseSpi) < obj.requiredSpi)
          return {status: true, response: obj.name + " no longer meets Spirit requirements and was removed."};          
      }
      
      return {status: false};
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

    function getAvailablePrestigeClasses() {
      var race = $scope.selectedRace;
      var baseClass = $scope.selectedBaseClass;

      $scope.prestigeClasses.forEach(function(prestigeClass) {
        if (race && baseClass) {
          if (prestigeClass.availableBaseClasses.indexOf(baseClass.name) !== -1 && 
              prestigeClass.availableRaces.indexOf(race.name) !== -1) {
            prestigeClass.available = true;
          } else {
            prestigeClass.available = false;
          }
        }
      });
    };

    function getAvailableDisciplines() {
      var race = $scope.selectedRace;
      var baseClass = $scope.selectedBaseClass;
      var prestigeClass = $scope.selectedPrestigeClass;

      if (race && baseClass && prestigeClass) {
        $scope.disciplines.forEach(function(discipline) {
          if (discipline.availableBaseClasses.indexOf(baseClass.name) !== -1 && 
              discipline.availableRaces.indexOf(race.name) !== -1 &&
              discipline.availablePrestigeClasses.indexOf(prestigeClass.name) !== -1) {
            discipline.available = true;

            if ($scope.prohibitedDisciplines.length > 0 && checkProhibitedRestriction(discipline)) {
              discipline.prohibited = true;
            } else {
              discipline.prohibited = false;
            }
          } else {
            discipline.available = false;
          }
        });
      }
    }

    function getAvailableStatRunes() {
      $scope.statRunes.forEach(function(statRune) {
        var requirement = checkStatRequirements(statRune);

        if (!requirement.status) {
          statRune.requirement = false;
        } else {
          statRune.requirement = true;
          statRune.requirementMessage = requirement.response;
          if (statRune.selected) {
            growl.addWarnMessage(statRune.name + " was removed: " + statRune.requirementMessage, {ttl: 5000});
            deselectStatRune(statRune);
          }
        }
      });
      
    }

    function getAvailableMasteries() {
      var prestigeClass = $scope.selectedPrestigeClass;

      if (prestigeClass) {
        $scope.masteries.forEach(function(mastery) {
          if (prestigeClass.availableMasteries.indexOf(mastery.name) !== -1) {
            mastery.available = true;            
          } else {
            mastery.available = false;
          }
        });
      }
    }

    function getAvailableRunes() {
      getAvailableDisciplines();
      getAvailableMasteries();
      getAvailableStatRunes();
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
          var requirement = checkStatRequirements(trait, 'trait');
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

    function checkProhibitedRestriction(disc) {
      if ($scope.prohibitedDisciplines.indexOf(disc.name) !== -1) {
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

    $scope.increaseStat = function(stat, value) {
      if ($scope.remainingPoints >= value) {
        switch (stat) {
          case 'strength':
            if ($scope.stats.currentStrength + value <= $scope.stats.maxStrength) {
              $scope.stats.currentStrength += value;
              $scope.remainingPoints -= value;
            }
            break;
          case 'dexterity':
            if ($scope.stats.currentDexterity + value <= $scope.stats.maxDexterity) {
              $scope.stats.currentDexterity += value;
              $scope.remainingPoints -= value;
            }
            break;
          case 'constitution':
            if ($scope.stats.currentConstitution + value <= $scope.stats.maxConstitution) {
              $scope.stats.currentConstitution += value;
              $scope.remainingPoints -= value;
            }
            break;
          case 'intelligence':
            if ($scope.stats.currentIntelligence + value <= $scope.stats.maxIntelligence) {
              $scope.stats.currentIntelligence += value;
              $scope.remainingPoints -= value;
            }
            break;
          case 'spirit':
            if ($scope.stats.currentSpirit + value <= $scope.stats.maxSpirit) {
              $scope.stats.currentSpirit += value;
              $scope.remainingPoints -= value;
            }
            break;
          default:
            console.log('Error: tried to increase non-existent stat');
        }
        getAvailableTraits();
        getAvailableStatRunes();
      }
    }

    $scope.decreaseStat = function(stat, value) {
      if ($scope.remainingPoints + value <= $scope.maxPoints) {
        switch (stat) {
          case 'strength':
            if ($scope.stats.currentStrength - value >= $scope.stats.baseStrength) {
              $scope.stats.currentStrength -= value;
              $scope.remainingPoints += value;
            }
            break;
          case 'dexterity':
            if ($scope.stats.currentDexterity - value >= $scope.stats.baseDexterity) {
              $scope.stats.currentDexterity -= value;
              $scope.remainingPoints += value;
            }
            break;
          case 'constitution':
            if ($scope.stats.currentConstitution - value >= $scope.stats.baseConstitution) {
              $scope.stats.currentConstitution -= value;
              $scope.remainingPoints += value;
            }
            break;
          case 'intelligence':
            if ($scope.stats.currentIntelligence - value >= $scope.stats.baseIntelligence) {
              $scope.stats.currentIntelligence -= value;
              $scope.remainingPoints += value;
            }
            break;
          case 'spirit':
            if ($scope.stats.currentSpirit - value >= $scope.stats.baseSpirit) {
              $scope.stats.currentSpirit -= value;
              $scope.remainingPoints += value;
            }
            break;
          default:
            console.log('Error: tried to decrease non-existent stat');
        }
        getAvailableTraits();
        getAvailableStatRunes();
      }
    };

    $scope.minStat = function(stat) {
      var changeVal;

      switch (stat) {
        case 'strength':
          changeVal = $scope.stats.currentStrength - $scope.stats.baseStrength;
          break;
        case 'dexterity':
          changeVal = $scope.stats.currentDexterity - $scope.stats.baseDexterity;
          break;
        case 'constitution':
          changeVal = $scope.stats.currentConstitution - $scope.stats.baseConstitution;
          break;
        case 'intelligence':
          changeVal = $scope.stats.currentIntelligence - $scope.stats.baseIntelligence;
          break;
        case 'spirit':
          changeVal = $scope.stats.currentSpirit - $scope.stats.baseSpirit;
          break;
      }

      $scope.decreaseStat(stat, changeVal);
    };

    $scope.maxStat = function(stat) {
      var changeVal, changeDiff;

      switch (stat) {
        case 'strength':
          changeDiff = $scope.stats.maxStrength - $scope.stats.currentStrength;
          if (changeDiff > $scope.remainingPoints) changeVal = $scope.remainingPoints;
          else changeVal = changeDiff
          break;
        case 'dexterity':
          changeDiff = $scope.stats.maxDexterity - $scope.stats.currentDexterity;
          if (changeDiff > $scope.remainingPoints) changeVal = $scope.remainingPoints;
          else changeVal = changeDiff;
          break;
        case 'constitution':
          changeDiff =  $scope.stats.maxConstitution - $scope.stats.currentConstitution;
          if (changeDiff > $scope.remainingPoints) changeVal = $scope.remainingPoints;
          else changeVal = changeDiff;
          break;
        case 'intelligence':
          changeDiff = $scope.stats.maxIntelligence - $scope.stats.currentIntelligence;
          if (changeDiff > $scope.remainingPoints) changeVal = $scope.remainingPoints;
          else changeVal = changeDiff;
          break;
        case 'spirit':
          changeDiff = $scope.stats.maxSpirit - $scope.stats.currentSpirit;
          if (changeDiff > $scope.remainingPoints) changeVal = $scope.remainingPoints;
          else changeVal = changeDiff;
          break;
      }

      $scope.increaseStat(stat, changeVal);
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
      var tooltip = '<ul class="list-unstyled rune-tooltip">'

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

    $scope.getStatRuneTooltip = function(statRune) {
      var tooltip = '<ul class="list-unstyled rune-tooltip">'

      tooltip += "<li>Cost: " + statRune.cost + "</li>";

      if (statRune.category) tooltip += "<li>Category: " + statRune.category;

      if (statRune.requiredStr > 0) tooltip += "<li>Required Str: " + statRune.requiredStr + "</li>";
      if (statRune.requiredDex > 0) tooltip += "<li>Required Dex: " + statRune.requiredDex + "</li>";
      if (statRune.requiredCon > 0) tooltip += "<li>Required Con: " + statRune.requiredCon + "</li>";
      if (statRune.requiredInt > 0) tooltip += "<li>Required Int: " + statRune.requiredInt + "</li>";
      if (statRune.requiredSpi > 0) tooltip += "<li>Required Spi: " + statRune.requiredSpi + "</li>";

      if (statRune.grantedBaseStr !== 0) tooltip += "<li>Granted Base Str: " + statRune.grantedBaseStr + "</li>";
      if (statRune.grantedMaxStr !== 0) tooltip += "<li>Granted Max Str: " + statRune.grantedMaxStr + "</li>";

      if (statRune.grantedBaseDex !== 0) tooltip += "<li>Granted Base Dex: " + statRune.grantedBaseDex + "</li>";
      if (statRune.grantedMaxDex !== 0) tooltip += "<li>Granted Max Dex: " + statRune.grantedMaxDex + "</li>";

      if (statRune.grantedBaseCon !== 0) tooltip += "<li>Granted Base Con: " + statRune.grantedBaseCon + "</li>";
      if (statRune.grantedMaxCon !== 0) tooltip += "<li>Granted Max Con: " + statRune.grantedMaxCon + "</li>";

      if (statRune.grantedBaseInt !== 0) tooltip += "<li>Granted Base Int: " + statRune.grantedBaseInt + "</li>";
      if (statRune.grantedMaxInt !== 0) tooltip += "<li>Granted Max Int: " + statRune.grantedMaxInt + "</li>";

      if (statRune.grantedBaseSpi !== 0) tooltip += "<li>Granted Base Spi: " + statRune.grantedBaseSpi + "</li>";
      if (statRune.grantedMaxSpi !== 0) tooltip += "<li>Granted Max Spi: " + statRune.grantedMaxSpi + "</li>";

      tooltip += '</ul>';

      return tooltip;
    };
  }
]);
