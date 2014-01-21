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
        scope.index--;
      };
      scope.next = function() {
        scope.index++;
      };
    },
    template: '<div class="rn-carousel-controls">' +
                '<span class="rn-carousel-control rn-carousel-control-prev" ng-click="prev()" ng-if="index > 0"></span>' +
                '<span class="rn-carousel-control rn-carousel-control-next" ng-click="next()" ng-if="index < items.length - 1"></span>' +
              '</div>'
  };
}]);
