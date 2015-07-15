'use strict';

angular.module('intercomDashboardApp')
  .controller('DiagnosisCtrl', function ($scope, $http) {

    getUsers(1);

    $scope.users = [];
    $scope.noStage = [];
    $scope.multiStage = [];

    function getUsers(i) {
      $http.get('/api/intercom/users/' + i)
      .success(function(response){
        console.log(response);
        $scope.users = $scope.users.concat(response.users);
        if(response.pages.page < response.pages.total_pages) {
          getUsers(i+1);
        } else {
          console.log('USERS', $scope.users);
          findStageErrors();
        }
      });
    }

    function findStageErrors(){
      for(var i in $scope.users) {
        var stageFound = false;
        var cohortFound = false;
        for(var m in $scope.users[i].tags.tags) {
          if($scope.users[i].tags.tags[m].name.indexOf('stage-') > -1) {
            if(stageFound) {
              $scope.multiStage.push($scope.users[i]);
            } else {
              stageFound = true;
            }
          }
        }
        if(!stageFound) {
          $scope.noStage.push($scope.users[i]);
        }
      }
      console.log('No Stage', $scope.noStage);
      console.log('Multi', $scope.multiStage);
    }

  });
