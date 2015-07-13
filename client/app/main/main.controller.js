'use strict';

angular.module('intercomDashboardApp')
  .controller('MainCtrl', function ($scope, $http, User) {

    $scope.stageTags = [];
    $scope.totaledStageTags = [];
    $scope.cohortTags = [];
    $scope.tagsFetched = 0;

    $http.get('/api/intercom')
    .success(function(intercom) {
      $scope.tags = intercom.tags.tags;
      $scope.totalUsers = intercom.users.total_count;
      getTags();
    })
    .catch(function(err){
      console.log(err);
    });

    function getTags(){
      for (var i = 0; i < $scope.tags.length; i++) {
        $http.get('/api/intercom/tagNum/' + $scope.tags[i].id + '/' + i)
        .success(function(response){
          $scope.tags[response.index].total_count = response.total_count;
          $scope.tagsFetched++;
          if($scope.tagsFetched == $scope.tags.length){
            //buildBars();
            sortCohortTags();
            sortStageTags();

          }
        });

        if($scope.tags[i].name.indexOf('stage-') > -1 ) {
          $scope.stageTags.push($scope.tags[i]);
        } else if($scope.tags[i].name.indexOf('cohort-') > -1 ) {
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
      angular.copy($scope.stageTags, $scope.totaledStageTags);
      //$scope.totaledStageTags = $scope.stageTags;
      for (var i = $scope.totaledStageTags.length - 1; i >= 1; i--) {
        $scope.totaledStageTags[i-1].total_count = $scope.totaledStageTags[i-1].total_count + $scope.totaledStageTags[i].total_count;
        $scope.stageTags[i].overall_count = $scope.totaledStageTags[i].total_count;
      }
      $scope.stageTags[0].overall_count = $scope.totaledStageTags[0].total_count;
      //console.log('totaled',$scope.totaledStageTags);
      calcConversionRates();
    }

    function calcConversionRates(){
      for(var i = 1; i < $scope.stageTags.length; i++) {
        $scope.stageTags[i].stageConversionRate = ( ($scope.stageTags[i].overall_count / $scope.stageTags[i-1].overall_count) * 100).toFixed(2);
        $scope.stageTags[i].overallConversionRate = ( ($scope.stageTags[i].overall_count / $scope.stageTags[0].overall_count) * 100).toFixed(2);
        //console.log($scope.stageTags[i].stageConversionRate);
      }
    }

    // function buildBars(){
    //   var barData = [];
    //   for (var i = 0; i < $scope.tags.length; i++) {
    //     barData.push($scope.tags[i].total_count);
    //   };
    //   console.log('finished!', barData);
    //   //  the size of the overall svg element
    //   var height = 200,
    //     width = 720,
    //     barWidth = 40,
    //     barOffset = 20;


    //   var svg = d3.select('#barChart').append('svg')
    //     .attr('width', width)
    //     .attr('height', height)
    //     .style('background', '#dff0d8')
    //     .selectAll('rect').data(barData)
    //     .enter().append('rect')
    //       .style({'fill': '#3c763d', 'stroke': '#d6e9c6', 'stroke-width': '5'})
    //       .attr('width', barWidth)
    //       .attr('height', function (data) {
    //           return data;
    //       })
    //       .attr('x', function (data, i) {
    //           return i * (barWidth + barOffset);
    //       })
    //       .attr('y', function (data) {
    //           return height - data;
    //       });

    //     svg.selectAll("text")
    //       .data(barData)
    //       .enter()
    //       .append("text")
    //       .text(function(d) {
    //             return d;
    //        })
    //       .attr("x", function(d, i) {
    //             return i * (barWidth / barData.length);
    //        })
    //        .attr("y", function(d) {
    //             return height - (d * 4);
    //        });
    //        console.log('finished labels');
    // } //end buildBars function


  });
