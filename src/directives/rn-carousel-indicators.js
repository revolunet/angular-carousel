angular.module('angular-carousel')

.directive('rnCarouselIndicators', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      slides: '=',
      index: '=rnCarouselIndex'
    },
    templateUrl: 'carousel-indicators.html',
    link: function(scope, iElement, iAttributes, carouselCtrl) {
      console.log('carouselCtrl', carouselCtrl);
    }
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-indicators.html',
      '<div>\n' +
      ' <span ng-repeat="slide in currentSlides" ng-click="$parent.carouselIndex=$index" ng-class="{active: $index==$parent.carouselIndex}"></span>\n' +
      '</div>'
  );
}]);
