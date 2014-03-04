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
                '<span ng-repeat="item in items" ng-click="$parent.index=$index" ng-class="{' +
                    'active: $index==$parent.index,' +
                    'first: $index==0,' +
                    'last: $index==(items.length-1)' +
                  '}"></span>' +
              '</div>'
  };
}]);
