angular.module('angular-carousel')

.directive('rnCarouselIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      slides: '=',
      index: '=rnCarouselIndex'
    },
    templateUrl: 'carousel-indicators.html'
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-indicators.html',
      '<div class="carousel-indicator">\n' +
        '<span ng-class="{active: $index==index}" ng-repeat="slide in slides" ng-click="$parent.index=$index">●</span>' +
      '</div>'
  );
}]);
