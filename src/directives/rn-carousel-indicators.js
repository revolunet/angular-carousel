angular.module('angular-carousel')

.directive('rnCarouselIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '=',
      delegate: '&'
    },
    controller : function($scope) {
      $scope.setActive = function(item) {
       var index = $scope.items.indexOf(item);
       if (index !== $scope.index) {
         $scope.delegate().setActive(index);
       }
      }
    },
    template: '<div class="rn-carousel-indicator">' +
                '<span ng-repeat="item in items" ng-click="setActive(item)" ng-class="{active: $index==$parent.index}">●</span>' +
              '</div>'
  };
}]);
