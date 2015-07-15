'use strict';

describe('Controller: DiagnosisCtrl', function () {

  // load the controller's module
  beforeEach(module('intercomDashboardApp'));

  var DiagnosisCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DiagnosisCtrl = $controller('DiagnosisCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
