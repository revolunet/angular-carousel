angular.module('angular-carousel')

.directive('rnCarouselInfinite', function($parse, $compile) {
  return {
    restrict: 'EA',
    transclude:  true,
    replace: true,
    scope: true,
    template: '<ul rn-carousel rn-carousel-buffered><li ng-transclude></li></ul>',
    compile: function(tElement, tAttrs, linker) {
      var repeatExpr = tAttrs.rnCarouselCurrent + ' in items';
      tElement.find('li').attr('ng-repeat', repeatExpr);
      return function(scope, iElement, iAttrs) {
        // wrap the original content in a real rn-carousel
        scope.currentItem = $parse(iAttrs.rnCarouselCurrent)(scope);
        scope.items = [scope.currentItem];
        scope.$watchCollection('carouselCollection.position', function(newValue) {
          // assign the new item to the parent scope
          $parse(iAttrs.rnCarouselCurrent).assign(scope.$parent, scope.items[newValue]);
        });
      };
    }
  };
});
