'use strict';

//Setting up route
angular.module('mean.toons').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        //================================================
        // Check if the user is connected
        //================================================
        var checkLoggedin = function($q, $timeout, $http, $location) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user) {
                // Authenticated
                if (user !== '0')
                    $timeout(deferred.resolve, 0);

                // Not Authenticated
                else {
                    $timeout(function() {
                        deferred.reject();
                    }, 0);
                    $location.url('/login');
                }
            });

            return deferred.promise;
        };
        //================================================
        // Check if the user is not conntect
        //================================================
        var checkLoggedOut = function($q, $timeout, $http, $location) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user) {
                // Authenticated
                if (user !== '0') {
                    $timeout(function() {
                        deferred.reject();
                    }, 0);
                    $location.url('/login');

                }

                // Not Authenticated
                else {
                    $timeout(deferred.resolve, 0);

                }
            });

            return deferred.promise;
        };
        //================================================


        // states for my app
        $stateProvider
            .state('all toons', {
                url: '/toons',
                templateUrl: 'public/toons/views/list.html'
            })
            .state('create toon', {
                url: '/toons/create',
                templateUrl: 'public/toons/views/create.html'
            })
            .state('edit toon', {
                url: '/toons/:toonId/edit',
                templateUrl: 'public/toons/views/edit.html',
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('toon by id', {
                url: '/toons/:toonId',
                templateUrl: 'public/toons/views/view.html'
            })
    }
])
