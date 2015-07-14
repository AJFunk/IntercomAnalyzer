'use strict';

angular.module('intercomDashboardApp')
  .controller('MainCtrl', function ($scope, $http, User) {

    $scope.stageTags = [];
    $scope.cohortTags = [];
    $scope.acceptedUsers = [];
    $scope.enrolledUsers = [];
    $scope.tagsFetched = 0;
    $scope.loading = false;
    $scope.apiCalls = 0;

    $http.get('/api/intercom/stats')
    .success(function(intercom) {
      console.log(intercom[0]);
      var data = intercom[0].alldata;
      $scope.last_updated = intercom[0].last_updated;
      $scope.stageTags = data.stageTags;
      $scope.cohortTags = data.cohortTags;
    });


    $scope.fetchData = function() {
      $scope.stageTags = [];
      $scope.cohortTags = [];
      $scope.acceptedUsers = [];
      $scope.enrolledUsers = [];
      $scope.loading = true;
      $http.get('/api/intercom')
      .success(function(intercom) {
        $scope.tags = intercom.tags.tags;
        $scope.totalUsers = intercom.users.total_count;
        $scope.segments = intercom.segments.segments;
        console.log('SEGMENTS', $scope.segments);
        $scope.apiCalls++;
        getTags();
      })
      .catch(function(err){
        console.log(err);
      });
    }

    function getTags(){
      for (var i = 0; i < $scope.tags.length; i++) {
        $http.get('/api/intercom/tagNum/' + $scope.tags[i].id + '/' + i)
        .success(function(response){
          $scope.apiCalls++;
          $scope.tags[response.index].total_count = response.total_count;
          $scope.tagsFetched++;
          if($scope.tagsFetched == $scope.tags.length){
            sortCohortTags();
            sortStageTags();

          }
        });

        if($scope.tags[i].name.indexOf('stage-') > -1 ) {
          $scope.stageTags.push($scope.tags[i]);
        } else if($scope.tags[i].name.indexOf('cohort-') > -1 ) {
          $scope.tags[i].acceptedCount = 0;
          $scope.tags[i].enrolledCount = 0;
          $scope.cohortTags.push($scope.tags[i]);
        }
      };

    }

    function sortCohortTags(){
      var months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
      var years = [];
      var temp = [];
      var result = [];
      var x;
      for (var i = 0; i < $scope.cohortTags.length; i++) {
        x = $scope.cohortTags[i].name.split('-');
        if(years.indexOf(x[x.length-1]) < 0){
          years.push(x[x.length-1]);
        }
      }

      years.sort();

      for (var i = 0; i < years.length; i++) {
        temp = [];
        for (var m = 0; m < $scope.cohortTags.length; m++) {
          if($scope.cohortTags[m].name.indexOf(years[i]) > 0) {
            temp.push($scope.cohortTags[m]);
          }

        }
        //console.log(temp);
        //sort by months
        for(var n in months) {
          for (var t = 0; t < temp.length; t++) {
            if(temp[t].name.indexOf(months[n]) > 0){
              result.push(temp[t]);
            }
          }
        }

      }
      $scope.cohortTags = result;

      for(var i in $scope.cohortTags) {
        var x = $scope.cohortTags[i].name.replace('cohort-', '').replace('-', ' ');
        $scope.cohortTags[i].display_name = x.charAt(0).toUpperCase() + x.slice(1);
      }
    }


    function sortStageTags(){
      var temp = [];
      var stages = [
        'stage-app-request',
        'stage-app-submitted',
        'stage-interview-request-1',
        'stage-interview-request-2',
        'stage-accepted',
        'stage-deposit-in',
        'stage-background-check-sent',
        'stage-background-check-done',
        'stage-paperwork-sent',
        'stage-enrolled'
      ];

      for(var i in stages) {
        for (var m = 0; m < $scope.stageTags.length; m++) {
          if($scope.stageTags[m].name == stages[i]) {
            temp.push($scope.stageTags[m]);
          }
          //console.log($scope.stageTags)

        }
      }
      $scope.stageTags = temp;
      totalStageTags();
    }

    function totalStageTags(){
      var x = angular.copy($scope.stageTags);
      for (var i = x.length - 1; i >= 1; i--) {
        x[i-1].total_count = x[i-1].total_count + x[i].total_count;
        $scope.stageTags[i].overall_count = x[i].total_count;
      }
      $scope.stageTags[0].overall_count = x[0].total_count;
      calcConversionRates();
    }

    function calcConversionRates(){
      for(var i = 1; i < $scope.stageTags.length; i++) {
        $scope.stageTags[i].stageConversionRate = ( ($scope.stageTags[i].overall_count / $scope.stageTags[i-1].overall_count) * 100).toFixed(2);
        $scope.stageTags[i].overallConversionRate = ( ($scope.stageTags[i].overall_count / $scope.stageTags[0].overall_count) * 100).toFixed(2);
        //console.log($scope.stageTags[i].stageConversionRate);
      }
      getAccepted(1);
    }

    function getAccepted(page){
      var acceptedId = '96456';
      $http.get('/api/intercom/tagPage/' + acceptedId + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        //console.log(response.users);
        $scope.acceptedUsers = $scope.acceptedUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getAccepted(response.pages.page+1);
        } else {
          getEnrolled(1);
        }
      });
    };

    function getEnrolled(page){
      var enrolledId = '122470';
      $http.get('/api/intercom/tagPage/' + enrolledId + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        //console.log(response.users);
        $scope.enrolledUsers = $scope.enrolledUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getEnrolled(response.pages.page+1);
        } else {
          countAcceptedEnrolled();
        }
      });
    };

    function countAcceptedEnrolled(){
      for(var i in $scope.cohortTags){
        for(var m in $scope.acceptedUsers) {
          for(var n in $scope.acceptedUsers[m].tags.tags) {
            if($scope.acceptedUsers[m].tags.tags[n].name === $scope.cohortTags[i].name) {
              //console.log($scope.acceptedUsers[m].name, " is in ", $scope.cohortTags[i].name);
              $scope.cohortTags[i].acceptedCount++;
            }
          }
        }
      }

      for(var i in $scope.cohortTags){
        for(var m in $scope.enrolledUsers) {
          for(var n in $scope.enrolledUsers[m].tags.tags) {
            if($scope.enrolledUsers[m].tags.tags[n].name === $scope.cohortTags[i].name) {
              //console.log($scope.acceptedUsers[m].name, " is in ", $scope.cohortTags[i].name);
              $scope.cohortTags[i].enrolledCount++;
            }
          }
        }
      }
      console.log($scope.cohortTags);
      finished();
    }

    function finished(){
      $scope.loading = false;
      var stats = {
        alldata: {
          stageTags: $scope.stageTags,
          cohortTags: $scope.cohortTags
        },
        last_updated: new Date().toISOString()
      };
      $http.put('/api/intercom', stats)
      .success(function(res){
        console.log('UPDATE COMPLETE', res);
        $scope.last_updated = res[0].last_updated;
      });
    }



  });
