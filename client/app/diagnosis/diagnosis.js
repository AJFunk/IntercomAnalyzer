'use strict';

angular.module('intercomDashboardApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('diagnosis', {
        url: '/diagnosis',
        templateUrl: 'app/diagnosis/diagnosis.html',
        controller: 'DiagnosisCtrl'
      });
  });