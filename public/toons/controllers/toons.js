'use strict';

angular.module('mean.toons').controller('ToonsController', ['$scope', '$stateParams', '$location', 'Global', 'Toons', function ($scope, $stateParams, $location, Global, Toons) {
    $scope.global = Global;

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
}]);
