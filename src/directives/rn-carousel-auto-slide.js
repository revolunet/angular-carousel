angular.module('angular-carousel')

.directive('rnCarouselAutoSlide', ['$interval', function($interval) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        var delay = Math.round(parseFloat(attrs.rnCarouselAutoSlide) * 1000),
            timer = isPaused = increment = false;

        stopAutoplay = function () {
            if (angular.isDefined(timer)) {
                $interval.cancel(timer);
            }
            timer = undefined;
        };

        increment = function () {
            if(!isPaused){
                if (scope.indicatorIndex < scope.carouselIndicatorArray.length - 1) {
                    scope.indicatorIndex++;
                } else {
                    scope.indicatorIndex = 0;
                }
            }

        };

        timer = $interval(increment, delay);
        if (attrs.rnCarouselPauseOnHover && attrs.rnCarouselPauseOnHover != 'false'){
            element.on('mouseenter', function(){
                stopAutoplay();
            });

            element.on('mouseleave', function(){
                timer = $interval(increment, delay);
            });
        }

        scope.$on('$destroy', stopAutoplay);

    }
  };
}]);