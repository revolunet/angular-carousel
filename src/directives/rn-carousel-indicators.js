angular.module('angular-carousel')

.directive('rnCarouselIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    template: '<div class="rn-carousel-indicator">' +
                '<span ng-repeat="item in items" ng-click="$parent.index=$index" ng-class="{active: $index==$parent.index}"></span>' +
              '</div>'
  };
}]);
