angular.module('angular-carousel')

.directive('rnCarouselIndicators', ['$rootScope', '$timeout', function($rootScope, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      items: '=',
      index: '='
    },
    template: '<div class="rn-carousel-indicator">' +
                '<span ng-repeat="item in items" ng-class="{active: $index==$parent.index}" ng-click="select($event, $index)">&bull;</span>' +
              '</div>',
    link:function(scope, element, attrs){
      var carouselId;
      $timeout(function(){
        carouselId = element.parent().attr('id');
      }, 300);

      scope.select = function(e, index) {
        if(e) e.stopPropagation();
        $rootScope.$broadcast('angularCarousel:select', carouselId, index);
      };
    }

  };
}]);
