'use strict';

angular.module('intercomDashboardApp')
  .controller('MainCtrl', function ($scope, $http, User) {

    $scope.stageTags = [];
    $scope.cohortTags = [];
    $scope.appReqUsers = [];
    $scope.acceptedUsers = [];
    $scope.enrolledUsers = [];
    $scope.graduatedUsers = [];
    //$scope.residents = [];
    $scope.jobUsers = [];
    $scope.tagsFetched = 0;
    $scope.loading = false;
    $scope.apiCalls = 0;
    $scope.dataFound = false;

    $http.get('/api/intercom/stats')
    .success(function(intercom) {
      var data = intercom[0].alldata;
      $scope.last_updated = intercom[0].last_updated;
      $scope.stageTags = data.stageTags;
      $scope.cohortTags = data.cohortTags;
      $scope.dataFound = true;
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
        console.log('TAGS', $scope.tags);
        $scope.totalUsers = intercom.users.total_count;
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

          var x = response.index;
          if($scope.tags[x].name.indexOf('stage-') > -1 ) {
            $scope.stageTags.push($scope.tags[x]);
          } else if($scope.tags[x].name.indexOf('cohort-') > -1 ) {
            var tag = $scope.tags[x];
            tag.acceptedCount = 0;
            tag.enrolledCount = 0;
            tag.graduatedCount = 0;
            tag.jobCount = 0;
            tag.appliedCount = 0;
            tag.appReqCount = 0;
            $scope.cohortTags.push($scope.tags[x]);
          }

          if($scope.tagsFetched == $scope.tags.length){
            sortCohortTags();
            sortStageTags();
          }

        });
      }
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
        'stage-1st-IR-scheduled',
        'stage-interview-request-2',
        'stage-accepted',
        'stage-deposit-in',
        'stage-background-check-sent',
        'stage-background-check-done',
        'stage-paperwork-sent',
        'stage-enrolled',
        'stage-graduated',
        'stage-job'
      ];

      for(var i in stages) {
        for (var m = 0; m < $scope.stageTags.length; m++) {
          if($scope.stageTags[m].name == stages[i]) {
            temp.push($scope.stageTags[m]);
          }
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
      }
      getAppReq(1);
    }

    function getAppReq(page){
      var appReqId = '88670';
      $http.get('/api/intercom/tagPage/' + appReqId + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.appReqUsers = $scope.appReqUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getAppReq(response.pages.page+1);
        } else {
          getAccepted(1);
        }
      });
    };

    function getAccepted(page){
      var acceptedId = '88687';
      $http.get('/api/intercom/tagPage/' + acceptedId + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.acceptedUsers = $scope.acceptedUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getAccepted(response.pages.page+1);
        } else {
          getDepositIn(1);
        }
      });
    };

    function getDepositIn(page){
      var ID = '90229';
      $http.get('/api/intercom/tagPage/' + ID + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.acceptedUsers = $scope.acceptedUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getDepositIn(response.pages.page+1);
        } else {
          getBGSent(1);
        }
      });
    };

    function getBGSent(page){
      var ID = '84569';
      $http.get('/api/intercom/tagPage/' + ID + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.acceptedUsers = $scope.acceptedUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getBGSent(response.pages.page+1);
        } else {
          getBGDone(1);
        }
      });
    };

    function getDepositIn(page){
      var ID = '95432';
      $http.get('/api/intercom/tagPage/' + ID + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.acceptedUsers = $scope.acceptedUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getDepositIn(response.pages.page+1);
        } else {
          getPaperwork(1);
        }
      });
    };

    function getPaperwork(page){
      var ID = '91092';
      $http.get('/api/intercom/tagPage/' + ID + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.acceptedUsers = $scope.acceptedUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getPaperwork(response.pages.page+1);
        } else {
          getEnrolled(1);
        }
      });
    };

    function getEnrolled(page){
      var enrolledId = '94371';
      $http.get('/api/intercom/tagPage/' + enrolledId + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.enrolledUsers = $scope.enrolledUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getEnrolled(response.pages.page+1);
        } else {
          getGrads(1);
        }
      });
    };

    function getGrads(page){
      var gradId = '124255';
      $http.get('/api/intercom/tagPage/' + gradId + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.graduatedUsers = $scope.graduatedUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getEnrolled(response.pages.page+1);
        } else {
          getJobs(1);
        }
      });
    };

    function getJobs(page){
      var jobId = '124253';
      $http.get('/api/intercom/tagPage/' + jobId + '/' + page)
      .success(function(response){
        $scope.apiCalls++;
        $scope.jobUsers = $scope.jobUsers.concat(response.users);
        if(response.pages.total_pages > response.pages.page) {
          getEnrolled(response.pages.page+1);
        } else {
          calcCohortStats();
        }
      });
    };

    // function getResidents(page){
    //   var residentId = '123549';
    //   $http.get('/api/intercom/tagPage/' + residentId + '/' + page)
    //   .success(function(response){
    //     $scope.apiCalls++;
    //     $scope.residents = $scope.residents.concat(response.users);
    //     if(response.pages.total_pages > response.pages.page) {
    //       getResidents(response.pages.page+1);
    //     } else {
    //       calcCohortStats();
    //     }
    //   });
    // };

    function calcCohortStats(){
      for(var i in $scope.cohortTags){

        for(var m in $scope.appReqUsers) {
          for(var n in $scope.appReqUsers[m].tags.tags) {
            if($scope.appReqUsers[m].tags.tags[n].name === $scope.cohortTags[i].name) {
              $scope.cohortTags[i].appReqCount++;
            }
          }
        }
        $scope.cohortTags[i].appliedCount = $scope.cohortTags[i].total_count - $scope.cohortTags[i].appReqCount;

        for(var m in $scope.acceptedUsers) {
          for(var n in $scope.acceptedUsers[m].tags.tags) {
            if($scope.acceptedUsers[m].tags.tags[n].name === $scope.cohortTags[i].name) {
              $scope.cohortTags[i].acceptedCount++;
            }
          }
        }

        for(var m in $scope.enrolledUsers) {
          for(var n in $scope.enrolledUsers[m].tags.tags) {
            if($scope.enrolledUsers[m].tags.tags[n].name === $scope.cohortTags[i].name) {
              $scope.cohortTags[i].enrolledCount++;
            }
          }
        }

        for(var m in $scope.graduatedUsers) {
          for(var n in $scope.graduatedUsers[m].tags.tags) {
            if($scope.graduatedUsers[m].tags.tags[n].name === $scope.cohortTags[i].name) {
              $scope.cohortTags[i].graduatedCount++;
            }
          }
        }

        for(var m in $scope.jobUsers) {
          for(var n in $scope.jobUsers[m].tags.tags) {
            if($scope.jobUsers[m].tags.tags[n].name === $scope.cohortTags[i].name) {
              $scope.cohortTags[i].jobCount++;
            }
          }
        }

        $scope.cohortTags[i].graduatedCount += $scope.cohortTags[i].jobCount;
        $scope.cohortTags[i].enrolledCount += $scope.cohortTags[i].graduatedCount;
        $scope.cohortTags[i].acceptedCount += $scope.cohortTags[i].enrolledCount;

        // for(var m in $scope.residents) {
        //   for(var n in $scope.residents[m].tags.tags) {
        //     if($scope.residents[m].tags.tags[n].name === $scope.cohortTags[i].name) {
        //       $scope.cohortTags[i].residentCount++;
        //     }
        //   }
        // }
      }

      console.log($scope.cohortTags);
      finished();
    }

    function finished(){
      $scope.loading = false;
      $('#fetch').hide();
      console.log('COHORTS', $scope.cohortTags);
      var stats = {
        alldata: {
          stageTags: $scope.stageTags,
          cohortTags: $scope.cohortTags
        }
      };
      if($scope.dataFound) {
        stats.last_updated = new Date().toISOString();
        $http.put('/api/intercom', stats)
        .success(function(res){
          $scope.last_updated = res[0].last_updated;
        });
      } else {
        $http.post('/api/intercom', stats)
        .success(function(res){
          $scope.dataFound = true;
          console.log('data saved');
        });
      }
    }



  });
