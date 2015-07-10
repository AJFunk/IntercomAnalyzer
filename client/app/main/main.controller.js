'use strict';

angular.module('intercomDashboardApp')
  .controller('MainCtrl', function ($scope, $http, User) {

    $scope.stageTags = [];

    $http.get('/api/intercom')
    .success(function(intercom) {
      console.log(intercom);
      $scope.tags = intercom.tags.tags;
      $scope.totalUsers = intercom.users.total_count;
      getStageTags();
    })
    .catch(function(err){
      console.log(err);
    });

    function getStageTags(){
      for (var i = 0; i < $scope.tags.length; i++) {

        $http.get('/api/intercom/tagNum/' + $scope.tags[i].id + '/' + i)
        .success(function(response){
          //console.log(response.index);
          $scope.tags[response.index].total_count = response.total_count;
        });

        if($scope.tags[i].name.indexOf('stage-') > -1 ) {
          $scope.stageTags.push($scope.tags[i]);
        }
      };
      //setTimeout(function(){ console.log($scope.tags); }, 3000);


    }


  });
