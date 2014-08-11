angular.module('angular-carousel')

.directive('rnCarouselControls', [function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    link: function(scope, element, attrs) {
      scope.prev = function() {
        if (scope.index > 0) scope.index--;
      };
      scope.next = function() {
        if (scope.index < scope.items.length-1) scope.index++;
      };
    },
    templateUrl: 'carousel-controls.html'
  };
}]);

angular.module('angular-carousel').run(['$templateCache', function($templateCache) {
  $templateCache.put('carousel-controls.html',
    '<div class="rn-carousel-controls">\n' +
    '  <span class="rn-carousel-control rn-carousel-control-prev" ng-click="prev()" ng-if="index > 0"></span>\n' +
    '  <span class="rn-carousel-control rn-carousel-control-next" ng-click="next()" ng-if="index < items.length - 1"></span>\n' +
    '</div>'
  );
}]);