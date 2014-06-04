angular.module('angular-carousel')

.directive('rnCarouselIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    templateUrl: 'carousel-indicators.html'
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-indicators.html',
      '<div class="rn-carousel-indicator">\n' +
      ' <span ng-repeat="item in items" ng-click="$parent.index=$index" ng-class="{active: $index==$parent.index}"></span>\n' +
      '</div>'
  );
}]);
