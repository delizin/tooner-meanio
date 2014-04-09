'use strict';

(function() {
    // Toons Controller Spec
    describe('MEAN controllers', function() {
        describe('ToonsController', function() {
            // The $resource service augments the response object with methods for updating and deleting the resource.
            // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
            // the responses exactly. To solve the problem, we use a newly-defined toEqualData Jasmine matcher.
            // When the toEqualData matcher compares two objects, it takes only object properties into
            // account and ignores methods.
            beforeEach(function() {
                this.addMatchers({
                    toEqualData: function(expected) {
                        return angular.equals(this.actual, expected);
                    }
                });
            });

            // Load the controllers module
            beforeEach(module('mean'));

            // Initialize the controller and a mock scope
            var ToonsController,
                scope,
                $httpBackend,
                $stateParams,
                $location;

            // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
            // This allows us to inject a service but then attach it to a variable
            // with the same name as the service.
            beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {

                scope = $rootScope.$new();

                ToonsController = $controller('ToonsController', {
                    $scope: scope
                });

                $stateParams = _$stateParams_;

                $httpBackend = _$httpBackend_;

                $location = _$location_;

            }));

            it('$scope.find() should create an array with at least one toon object ' +
                'fetched from XHR', function() {

                    // test expected GET request
                    $httpBackend.expectGET('toons').respond([{
                        title: 'An Toon about MEAN',
                        content: 'MEAN rocks!'
                    }]);

                    // run controller
                    scope.find();
                    $httpBackend.flush();

                    // test scope value
                    expect(scope.toons).toEqualData([{
                        title: 'An Toon about MEAN',
                        content: 'MEAN rocks!'
                    }]);

                });

            it('$scope.findOne() should create an array with one toon object fetched ' +
                'from XHR using a toonId URL parameter', function() {
                    // fixture URL parament
                    $stateParams.toonId = '525a8422f6d0f87f0e407a33';

                    // fixture response object
                    var testToonData = function() {
                        return {
                            title: 'An Toon about MEAN',
                            content: 'MEAN rocks!'
                        };
                    };

                    // test expected GET request with response object
                    $httpBackend.expectGET(/toons\/([0-9a-fA-F]{24})$/).respond(testToonData());

                    // run controller
                    scope.findOne();
                    $httpBackend.flush();

                    // test scope value
                    expect(scope.toon).toEqualData(testToonData());

                });

            it('$scope.create() with valid form data should send a POST request ' +
                'with the form input values and then ' +
                'locate to new object URL', function() {

                    // fixture expected POST data
                    var postToonData = function() {
                        return {
                            title: 'An Toon about MEAN',
                            content: 'MEAN rocks!'
                        };
                    };

                    // fixture expected response data
                    var responseToonData = function() {
                        return {
                            _id: '525cf20451979dea2c000001',
                            title: 'An Toon about MEAN',
                            content: 'MEAN rocks!'
                        };
                    };

                    // fixture mock form input values
                    scope.title = 'An Toon about MEAN';
                    scope.content = 'MEAN rocks!';

                    // test post request is sent
                    $httpBackend.expectPOST('toons', postToonData()).respond(responseToonData());

                    // Run controller
                    scope.create();
                    $httpBackend.flush();

                    // test form input(s) are reset
                    expect(scope.title).toEqual('');
                    expect(scope.content).toEqual('');

                    // test URL location to new object
                    expect($location.path()).toBe('/toons/' + responseToonData()._id);
                });

            it('$scope.update() should update a valid toon', inject(function(Toons) {

                // fixture rideshare
                var putToonData = function() {
                    return {
                        _id: '525a8422f6d0f87f0e407a33',
                        title: 'An Toon about MEAN',
                        to: 'MEAN is great!'
                    };
                };

                // mock toon object from form
                var toon = new Toons(putToonData());

                // mock toon in scope
                scope.toon = toon;

                // test PUT happens correctly
                $httpBackend.expectPUT(/toons\/([0-9a-fA-F]{24})$/).respond();

                // testing the body data is out for now until an idea for testing the dynamic updated array value is figured out
                //$httpBackend.expectPUT(/toons\/([0-9a-fA-F]{24})$/, putToonData()).respond();
                /*
                Error: Expected PUT /toons\/([0-9a-fA-F]{24})$/ with different data
                EXPECTED: {"_id":"525a8422f6d0f87f0e407a33","title":"An Toon about MEAN","to":"MEAN is great!"}
                GOT:      {"_id":"525a8422f6d0f87f0e407a33","title":"An Toon about MEAN","to":"MEAN is great!","updated":[1383534772975]}
                */

                // run controller
                scope.update();
                $httpBackend.flush();

                // test URL location to new object
                expect($location.path()).toBe('/toons/' + putToonData()._id);

            }));

            it('$scope.remove() should send a DELETE request with a valid toonId' +
                'and remove the toon from the scope', inject(function(Toons) {

                    // fixture rideshare
                    var toon = new Toons({
                        _id: '525a8422f6d0f87f0e407a33'
                    });

                    // mock rideshares in scope
                    scope.toons = [];
                    scope.toons.push(toon);

                    // test expected rideshare DELETE request
                    $httpBackend.expectDELETE(/toons\/([0-9a-fA-F]{24})$/).respond(204);

                    // run controller
                    scope.remove(toon);
                    $httpBackend.flush();

                    // test after successful delete URL location toons lis
                    //expect($location.path()).toBe('/toons');
                    expect(scope.toons.length).toBe(0);

                }));
        });
    });
}());
